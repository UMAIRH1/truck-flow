"use client";

import { Clock, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Load } from "@/types";
import Link from "next/link";

interface LoadCardProps {
  load: Load;
  showStatus?: boolean;
  showDriver?: boolean;
  onClick?: () => void;
  className?: string;
  variant?: "default" | "compact";
}

export function LoadCard({ load, showStatus = true, showDriver = true, onClick, className, variant = "default" }: LoadCardProps) {
  const formattedDate = new Date(load.loadingDate)
    .toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .replace(",", "");

  const formattedTime = load.loadingTime;

  const content = (
    <div className={cn("bg-yellow-400 rounded-2xl p-4 shadow-sm", onClick && "cursor-pointer hover:bg-yellow-300 transition-colors", className)}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Truck className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-sm">{load.clientName}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-700">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Today / {formattedTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <Truck className="h-3 w-3" />
            <span>{load.loadWeight} KG</span>
          </div>
        </div>
      </div>

      <div className="flex items-start justify-between">
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-600">↖</span>
            <span className="text-gray-700">From: {load.pickupLocation}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-600">↘</span>
            <span className="text-gray-700">To: {load.dropoffLocation}</span>
          </div>
        </div>
        <div className="text-right">
          <span className="font-bold text-base">Price ${load.clientPrice.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );

  if (onClick) {
    return <div onClick={onClick}>{content}</div>;
  }

  return <Link href={`/load/${load.id}`}>{content}</Link>;
}
