"use client";
import React from "react";
import { Separator } from "../ui/separator";

// --- TYPE DEFINITIONS ---
interface Metric {
  id: string;
  name: string;
  value: string;
  trend: string;
  trendDirection: "up" | "down" | "neutral";
}

interface AnalyticsHeaderProps {
  metrics: Metric[];
  selectedMetric: string;
  onMetricChange: (metricId: string) => void;
}

// --- SVG ICON COMPONENTS ---
const ArrowUpIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    fill="currentColor"
    viewBox="0 0 16 16"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5z"
    />
  </svg>
);

const ArrowDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    fill="currentColor"
    viewBox="0 0 16 16"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1z"
    />
  </svg>
);

// --- HEADER COMPONENT ---
export function AnalyticsHeader({
  metrics,
  selectedMetric,
  onMetricChange,
}: AnalyticsHeaderProps) {
  return (
    <header className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-x-6 gap-y-4 pb-6">
      {metrics.map((metric, index) => (
        <div key={metric.id} className="flex items-center">
          {/* Metric content */}
          <div className="flex flex-col gap-1 flex-1">
            <div className="flex items-center gap-2">
              <label
                htmlFor={metric.id}
                className="text-sm text-slate-400 cursor-pointer"
              >
                {metric.name}
              </label>
              {metric.name === "Visitors now" && (
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              )}
            </div>
            <p className="text-2xl font-bold text-white">{metric.value}</p>
            {metric.trend && (
              <div
                className={`flex items-center gap-1 text-xs ${
                  metric.trendDirection === "up"
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {metric.trendDirection === "up" ? (
                  <ArrowUpIcon />
                ) : (
                  <ArrowDownIcon />
                )}
                <span>{metric.trend}</span>
              </div>
            )}
          </div>

          {/* Separator only if not last item */}
          {index < metrics.length - 1 && (
            <Separator
              orientation="vertical"
              className="h-12 mx-3 bg-[#383838]"
            />
          )}
        </div>
      ))}
    </header>
  );
}
