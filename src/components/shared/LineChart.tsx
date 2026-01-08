"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface LineChartProps {
  data?: number[];
  labels?: string[];
  trend?: string;
  trendLabel?: string;
  className?: string;
}

export function LineChart({ data = [30, 45, 35, 50, 40, 55, 45, 60, 50, 65], labels = ["Oct", "Nov", "Dec"], trend = "+5%", trendLabel = "Last 3 Months", className }: LineChartProps) {
  // Create SVG path from data
  const width = 300;
  const height = 100;
  const padding = 10;

  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue || 1;

  const points = data
    .map((value, index) => {
      const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((value - minValue) / range) * (height - 2 * padding);
      return `${x},${y}`;
    })
    .join(" ");

  const pathD = `M ${points.split(" ").join(" L ")}`;

  return (
    <div className={cn("bg-white rounded-2xl p-4", className)}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-600">{trendLabel}</span>
        <span className="text-sm text-green-500 font-medium">{trend}</span>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-24">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e40af" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#1e40af" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Area fill */}
        <path d={`${pathD} L ${width - padding},${height - padding} L ${padding},${height - padding} Z`} fill="url(#lineGradient)" />

        {/* Line */}
        <path d={pathD} fill="none" stroke="#1e40af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      <div className="flex justify-between mt-2">
        {labels.map((label, index) => (
          <span key={index} className="text-xs text-gray-400">
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
