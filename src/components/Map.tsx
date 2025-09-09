"use client";

import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { feature } from "topojson-client";
import { FeatureCollection, GeoJsonProperties, Geometry } from "geojson";

interface CountryData {
  name: string;
  visitors: number;
  conversion: number;
  value: number;
}

interface TooltipData {
  x: number;
  y: number;
  data: CountryData;
}

// --- SAMPLE DATA ---
// ISO 3166-1 numeric codes are used as keys, which match the TopoJSON data.
const countryData: Record<string, CountryData> = {
  "840": {
    name: "United States",
    value: 444,
    visitors: 2700,
    conversion: 0.59,
  },
  "356": {
    name: "India",
    value: 200,
    visitors: 1800,
    conversion: 0.45,
  },
  "643": {
    name: "Russia",
    value: 1000,
    visitors: 850,
    conversion: 0.35,
  },
  "826": {
    name: "United Kingdom",
    value: 350,
    visitors: 1200,
    conversion: 0.71,
  },
  "036": {
    name: "Australia",
    value: 480,
    visitors: 950,
    conversion: 0.65,
  },
  "124": {
    name: "Canada",
    value: 500,
    visitors: 1100,
    conversion: 0.68,
  },
  "276": {
    name: "Germany",
    value: 600,
    visitors: 800,
    conversion: 0.55,
  },
};

// --- HELPER FUNCTIONS ---

// Formats large numbers into a 'k' format (e.g., 2700 -> 2.7k)
const formatNumber = (num: number): string => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "k";
  }
  return num.toString();
};

// Formats a number as currency
const formatCurrency = (num: number): string => {
  return "$" + formatNumber(num);
};

// --- REACT COMPONENT ---
export default function InteractiveMap({
  height,
  width,
  margin,
}: {
  height: number;
  width: number;
  margin: number;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const svgNode = svgRef.current;
    if (!svgNode) return;

    // --- COLOR SCALE ---
    const values = Object.values(countryData).map((d) => d.value);
    const valueExtent = d3.extent(values) as [number, number];
    const colorScale = d3
      .scaleSequential(d3.interpolateOranges)
      .domain(valueExtent);

    const projection = d3
      .geoMercator()
      .scale(130)
      .center([0, 40])
      .translate([width / 2, height / 2]);

    const pathGenerator = d3.geoPath().projection(projection);

    // Fetch and render the map
    d3.json<any>(
      "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"
    )
      .then((data) => {
        const countries = feature(
          data,
          data.objects.countries
        ) as unknown as FeatureCollection<Geometry, GeoJsonProperties>;

        // --- RESPONSIVE SCALING ---
        // Get the actual rendered size of the SVG to calculate the scaling factor
        const svgBBox = svgNode.getBoundingClientRect();
        const viewBox = svgNode.viewBox.baseVal;
        const scaleX = svgBBox.width / viewBox.width;
        const scaleY = svgBBox.height / viewBox.height;

        svg
          .selectAll("path")
          .data(countries.features)
          .join("path")
          .attr("d", pathGenerator)
          .attr(
            "class",
            "country-path stroke-gray-800 stroke-[0.5px] transition-opacity duration-200 hover:opacity-80"
          )
          .attr("fill", (d) => {
            const countryInfo = countryData[d.id as string];
            if (countryInfo) {
              return colorScale(countryInfo.value);
            }
            return "#4b5563"; // Equivalent to Tailwind's gray-600
          })
          .on("mouseover", (event, d) => {
            const data = countryData[d.id as string];
            if (data) {
              const [svgX, svgY] = d3.pointer(event);
              // Scale the coordinates from SVG space to screen space
              const screenX = svgX * scaleX;
              const screenY = svgY * scaleY;
              setTooltip({
                x: screenX,
                y: screenY,
                data: data,
              });
            }
          })
          .on("mousemove", (event) => {
            const [svgX, svgY] = d3.pointer(event);
            // Scale the coordinates from SVG space to screen space
            const screenX = svgX * scaleX;
            const screenY = svgY * scaleY;
            setTooltip((prev) =>
              prev ? { ...prev, x: screenX, y: screenY } : null
            );
          })
          .on("mouseout", () => {
            setTooltip(null);
          });
      })
      .catch((error) => console.error("Error loading map data:", error));
  }, []); // Empty dependency array ensures this runs once on mount

  return (
    <div className="flex items-center justify-center rounded-xl bg-[#282828] text-gray-200 font-sans">
      <div className="w-full max-w-6xl">
        <div className="">
          {/* Header Navigation */}
          <header className="flex justify-between items-center mb-4 border-b border-[#383838]">
            <nav className="flex px-4">
              <a href="#" className="nav-link active text-sm">
                Map
              </a>
              <a href="#" className="nav-link text-sm">
                Country
              </a>
              <a href="#" className="nav-link text-sm">
                Region
              </a>
              <a href="#" className="nav-link text-sm">
                City
              </a>
            </nav>
            <div className="flex mr-4 items-center text-sm text-gray-400">
              <span>Visitors</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 ml-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7l4-4m0 0l4 4m-4-4v18"
                />
              </svg>
            </div>
          </header>

          {/* Map and Tooltip Container */}
          <div className="relative">
            <svg
              ref={svgRef}
              className="w-full h-auto"
              viewBox={`0 ${margin} ${width} ${height}`}
            ></svg>

            {/* Tooltip Card */}
            {tooltip && (
              <div
                className="absolute bg-[#3d3c3c] rounded-lg shadow-xl p-4 text-gray-100 pointer-events-none transition-opacity duration-200"
                style={{
                  left: tooltip.x,
                  top: tooltip.y,
                  opacity: tooltip ? 1 : 0,
                  minWidth: "220px",
                  transform: "translate(-50%, -110%)",
                }}
              >
                <h3 className="font-bold text-lg mb-3">{tooltip.data.name}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-sky-400 mr-2"></div>
                      Visitors
                    </span>
                    <span className="font-semibold">
                      {formatNumber(tooltip.data.visitors)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-gray-400">
                    <span>Conversion rate</span>
                    <span>{tooltip.data.conversion.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <style jsx global>{`
          .nav-link {
            padding: 0.5rem 0;
            margin-right: 1.5rem;
            color: #9ca3af;
            border-bottom: 2px solid transparent;
            transition: color 0.2s, border-color 0.2s;
            font-weight: 500;
          }
          .nav-link:hover {
            color: #e5e7eb;
          }
          .nav-link.active {
            color: #e5e7eb;
          }
        `}</style>
      </div>
    </div>
  );
}
