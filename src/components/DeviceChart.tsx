"use client";

import { LabelList, Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "A pie chart with a label list";

interface DeviceData {
  name: string;
  value: number;
}

interface RoundedPieChartProps {
  data?: DeviceData[];
  title?: string;
  description?: string;
  trend?: string;
}

const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7c7c", "#8dd1e1"];

const chartConfig = {
  value: {
    label: "Visitors",
  },
} satisfies ChartConfig;

export function RoundedPieChart({ 
  data = [], 
  title = "Device Breakdown",
}: RoundedPieChartProps) {
  
  const chartData = data.map((device, index) => ({
    name: device.name,
    value: device.value,
    fill: colors[index % colors.length],
  }));
  return (
    <Card className="flex flex-col bg-[#282828] border border-[#383838]">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-white/80">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="[&_.recharts-text]:fill-background mx-auto aspect-square max-h-[350px]"
        >
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent nameKey="value" hideLabel />}
            />
            <Pie
              data={chartData}
              innerRadius={60}
              dataKey="value"
              radius={10}
              cornerRadius={8}
              paddingAngle={4}
            >
              <LabelList
                dataKey="value"
                stroke="none"
                fontSize={12}
                fontWeight={500}
                fill="currentColor"
                formatter={(value: number) => `${value}%`}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
