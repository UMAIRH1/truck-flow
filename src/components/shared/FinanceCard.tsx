"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface FinanceCardProps {
  label: string;
  value: string | number;
  trend?: string;
  trendDirection?: "up" | "down";
  variant?: "income" | "expense" | "profit" | "default";
  showArrow?: boolean;
  onClick?: () => void;
  className?: string;
}

const variantStyles = {
  income: "bg-yellow-400",
  expense: "bg-white border border-gray-200",
  profit: "bg-yellow-400",
  default: "bg-white border border-gray-200",
};

export function FinanceCard({ label, value, trend, trendDirection = "up", variant = "default", showArrow = false, onClick, className }: FinanceCardProps) {
  return (
    <div className={cn("rounded-xl p-4 cursor-pointer transition-colors", variantStyles[variant], onClick && "hover:opacity-90", className)} onClick={onClick}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-700">{label}</p>
          <p className="text-xl font-bold mt-1">{typeof value === "number" ? `$${value.toFixed(2)}` : value}</p>
        </div>
        <div className="flex items-center gap-2">
          {trend && <span className={cn("text-xs", trendDirection === "up" ? "text-green-600" : "text-red-600")}>↗ {trend}</span>}
          {showArrow && <ChevronRight className="h-5 w-5 text-gray-400" />}
        </div>
      </div>
    </div>
  );
}
