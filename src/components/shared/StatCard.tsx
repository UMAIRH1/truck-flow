"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  className?: string;
  iconClassName?: string;
}

export function StatCard({ icon: Icon, label, value, className, iconClassName }: StatCardProps) {
  return (
    <div className={cn("bg-white rounded-xl p-4 flex items-center gap-3 shadow-sm border border-gray-100", className)}>
      <div className={cn("p-2 rounded-lg bg-gray-100", iconClassName)}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}
