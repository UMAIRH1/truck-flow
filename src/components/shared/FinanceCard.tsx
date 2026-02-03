"use client";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ChevronRight } from "lucide-react";

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

export function FinanceCard({ label, value, trend, showArrow = false, onClick, className }: FinanceCardProps) {
  return (
    <div className={cn("rounded-xl p-4 border border-gray-200 cursor-pointer transition-colors hover:bg-(--color-yellow-light) ", onClick && "hover:opacity-90", className)} onClick={onClick}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-(--color-stat-gray)">{label}</p>
        </div>
        <div>
          <div>
            {trend && (
              <span className="text-black text-sm font-normal flex items-center gap-1">
                <ArrowUpRight className="h-4 w-4" /> {trend}
              </span>
            )}
          </div>
          <p className="text-xl font-semibold text-(--color-stat-gray) mt-1">{typeof value === "number" ? `€${value.toFixed(2)}` : value}</p>
        </div>
        <div className="flex items-center gap-2">{showArrow && <ChevronRight className="h-5 w-5 text-black" />}</div>
      </div>
    </div>
  );
}
