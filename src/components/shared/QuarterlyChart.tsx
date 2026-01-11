"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface QuarterData {
  quarter: string;
  value: number;
}

interface QuarterlyChartProps {
  data: QuarterData[];
  trend?: string;
  trendLabel?: string;
  className?: string;
}

export function QuarterlyChart({
  data = [
    { quarter: "Q1", value: 12000 },
    { quarter: "Q2", value: 7000 },
    { quarter: "Q3", value: 12000 },
    { quarter: "Q4", value: 3000 },
  ],
  trend = "+12%",
  trendLabel = "This Year",
  className,
}: QuarterlyChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-start gap-2 mb-2">
        <span className="text-base font-normal text-(--color-primary-gray-text) ">{trendLabel}</span>
        <span className="text-sm font-medium text-(--color-primary-green)">{trend}</span>
      </div>

      {data.map((item, index) => {
        const percentage = maxValue === 0 ? 0 : (item.value / maxValue) * 100;
        return (
          <div key={index} className="flex items-center gap-3">
            <span className="text-sm font-bold text-(--color-primary-gray-text) w-8">{item.quarter}</span>
            <div className="flex-1 h-8 overflow-hidden">
              <div className="h-full bg-(--color-border-primary-light) border-r-2 border-(--color-cloud-bg) transition-all duration-500" style={{ width: `${percentage}%` }} />
            </div>
            <span className="text-sm font-medium text-(--color-primary-gray-text) w-20 text-right">${item.value.toLocaleString()}</span>
          </div>
        );
      })}
    </div>
  );
}
