"use client";
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
    <div className={cn("bg-white rounded-lg max-sm:px-2 max-sm:py-4 sm:p-3 flex items-center gap-1 shadow-sm border border-gray-100", className)}>
      <div className={cn("", iconClassName)}>
        <Icon className="h-4 w-4 text-(--color-light-black-border)" />
      </div>
      <div>
        <p className="text-xs font-bold text-(--color-light-black-border)">{label}</p>
        <p className="text-xs font-normal text-(--color-light-black-border)">{value}</p>
      </div>
    </div>
  );
}
