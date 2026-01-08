"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { LoadStatus } from "@/types";

interface StatusBadgeProps {
  status: LoadStatus;
  className?: string;
}

const statusConfig: Record<LoadStatus, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
  accepted: { label: "Accepted", className: "bg-green-100 text-green-800" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-800" },
  "in-progress": { label: "In Progress", className: "bg-blue-100 text-blue-800" },
  delivered: { label: "Delivered", className: "bg-purple-100 text-purple-800" },
  completed: { label: "Completed", className: "bg-green-100 text-green-800" },
  dispute: { label: "Dispute", className: "bg-orange-100 text-orange-800" },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", config.className, className)}>{config.label}</span>;
}
