"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { CashflowItem } from "@/types";
import { Euro } from "lucide-react";
import { useTranslations } from "next-intl";

interface CashflowCardProps {
  item: CashflowItem;
  className?: string;
}

export function CashflowCard({ item, className }: CashflowCardProps) {
  const t = useTranslations("cashflow");

  const statusColors = {
    outstanding: "bg-(--color-greenish)",
    overdue: "bg-(--color-dangerous)",
    "due-this-week": "bg-(--color-greenish)",
  };

  const getStatusText = (status: string) => {
    if (status === "outstanding") return "";
    if (status === "overdue") return `${t("overdueBy")} ${item.daysOverdue} ${t("days")}`;
    if (status === "due-this-week") return `${t("dueIn")} ${item.daysOverdue ? Math.abs(item.daysOverdue) : 5} ${t("days")}`;
    return "";
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

  const statusText = getStatusText(item.status);

  return (
    <div className={cn("flex rounded-xl shadow-sm overflow-hidden", className)}>
      <div className={cn("w-12 flex items-center justify-center", statusColors[item.status])}>
        <Euro className="h-4 w-4 text-white" />
      </div>
      <div className="flex-1 bg-white p-4">
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-black text-sm">{item.name}</h3>
            {statusText && <span className={cn("text-xs font-medium", item.status === "overdue" ? "text-(--color-dangerous)" : "text-(--color-greenish)")}>{statusText}</span>}
          </div>
          <hr className="my-2 border-(--color-arsenic-text)" />
          <div className="mt-1 space-y-0.5 text-xs text-(--color-gray-light)">
            <p>
              {t("amount")}: <span className="font-bold">${item.amount.toLocaleString()}</span>{" "}
            </p>
            <p>
              {t("since")}: {formattedSince}
            </p>
            <p>
              {t("expected")}: {formattedExpected}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
