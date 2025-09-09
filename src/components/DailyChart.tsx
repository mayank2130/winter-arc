"use client";

import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
} from "recharts";
import { AnalyticsHeader } from "./Dashboard/Header";
import { useState } from "react";

interface DailyClicksChartProps {
  data: Array<{
    date: string;
    clicks: number;
  }>;
  totalClicks?: number;
  className?: string;
}

export function DailyClicksChart({
  data,
  totalClicks,
  className = "",
}: DailyClicksChartProps) {
  const [activeMetric, setActiveMetric] = useState("visitors");

  const yAxisTickFormatter = (value: number) => {
    if (value >= 1000) {
      return `${value / 1000}k`;
    }
    return value.toString();
  };

  return (
    <div className="bg-[#262626] rounded-xl shadow-lg pr-6  border border-[#383838]">
      <div className="px-6 pt-5">
        <AnalyticsHeader
          metrics={[
            {
              id: "visitors",
              name: "Visitors",
              value: "16.3k",
              trend: "-17.9%",
              trendDirection: "down",
            },
            {
              id: "session_time",
              name: "Session time",
              value: "4m 3s",
              trend: "+2.2%",
              trendDirection: "up",
            },
          ]}
          selectedMetric={activeMetric}
          onMetricChange={setActiveMetric}
        />
      </div>
      <ResponsiveContainer className={"m-0 p-0"} width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.7} />
              <stop offset="28%" stopColor="#3b82f6" stopOpacity={0.2} />
              <stop offset="40%" stopColor="#3b82f6" stopOpacity={0.06} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#374151"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            axisLine={{ stroke: "#4b5563", strokeWidth: 1 }}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#9ca3af" }}
            domain={["dataMin", "dataMax"]}
            type="category"
            scale="point"
          />
          <YAxis
            axisLine={{ stroke: "#4b5563", strokeWidth: 1 }}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#9ca3af" }}
            tickFormatter={yAxisTickFormatter}
            domain={[0, "dataMax"]}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-[#484848] rounded-lg p-3 px-4 w-56 text-left text-white text-sm shadow-lg">
                    <div className="text-white font-medium">
                      {payload[0].payload.date}
                    </div>
                    <div className="border-t border-gray-600 my-2"></div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-400 rounded-sm"></div>
                        <span className="text-white">Clicks</span>
                      </div>
                      <span className="text-white font-bold">
                        {payload[0].payload.clicks || payload[0].value}
                      </span>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="clicks"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#chartGradient)"
            dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
