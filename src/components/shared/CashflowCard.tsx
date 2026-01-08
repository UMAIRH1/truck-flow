"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { CashflowItem } from "@/types";
import { Euro } from "lucide-react";

interface CashflowCardProps {
  item: CashflowItem;
  className?: string;
}

export function CashflowCard({ item, className }: CashflowCardProps) {
  const statusColors = {
    outstanding: "border-l-yellow-500",
    overdue: "border-l-red-500",
    "due-this-week": "border-l-green-500",
  };

  const statusText = {
    outstanding: "",
    overdue: `Overdue by ${item.daysOverdue} days`,
    "due-this-week": `Due in ${item.daysOverdue ? Math.abs(item.daysOverdue) : 5} days`,
  };

  const formattedSince = new Date(item.since).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const formattedExpected = new Date(item.expected).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className={cn("bg-white rounded-xl p-4 border-l-4 shadow-sm", statusColors[item.status], className)}>
      <div className="flex items-start gap-3">
        <div className="p-2 bg-yellow-400 rounded-full">
          <Euro className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-sm">{item.name}</h3>
            {statusText[item.status] && <span className={cn("text-xs font-medium", item.status === "overdue" ? "text-red-500" : "text-green-500")}>{statusText[item.status]}</span>}
          </div>
          <div className="mt-1 space-y-0.5 text-xs text-gray-600">
            <p>Amount: ${item.amount.toLocaleString()}</p>
            <p>Since: {formattedSince}</p>
            <p>Expected: {formattedExpected}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
