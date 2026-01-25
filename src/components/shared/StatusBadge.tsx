"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { LoadStatus } from "@/types";
import { useTranslations } from "next-intl";

interface StatusBadgeProps {
  status: LoadStatus;
  className?: string;
}

const statusStyles: Record<LoadStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  accepted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  "in-progress": "bg-blue-100 text-blue-800",
  delivered: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  dispute: "bg-orange-100 text-orange-800",
};

const statusTranslationKeys: Record<LoadStatus, string> = {
  pending: "pending",
  accepted: "accepted",
  rejected: "rejected",
  "in-progress": "inProgress",
  delivered: "delivered",
  completed: "completed",
  dispute: "dispute",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const t = useTranslations("tabs");
  const style = statusStyles[status];
  const label = t(statusTranslationKeys[status]);

  return <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", style, className)}>{label}</span>;
}
