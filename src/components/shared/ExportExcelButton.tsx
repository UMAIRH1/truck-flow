"use client";

import React from "react";
import { FileDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLoads } from "@/contexts/LoadContext";
import { exportLoadsToExcel, exportPaymentsToExcel, exportProfitReportToExcel } from "@/lib/exportExcel";
import { useTranslations } from "next-intl";

interface ExportExcelButtonProps {
  type: "loads" | "payments" | "profit";
  className?: string;
}

export function ExportExcelButton({ type, className }: ExportExcelButtonProps) {
  const { loads } = useLoads();
  const t = useTranslations("export");

  const handleExport = () => {
    switch (type) {
      case "loads":
        exportLoadsToExcel(loads);
        break;
      case "payments":
        exportPaymentsToExcel(loads);
        break;
      case "profit":
        exportProfitReportToExcel(loads);
        break;
    }
  };

  const labelKeys: Record<string, string> = {
    loads: "exportLoads",
    payments: "exportPayments",
    profit: "exportProfitReport",
  };

  return (
    <button onClick={handleExport} className={cn("flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors", className)}>
      <FileDown className="h-4 w-4" />
      {t(labelKeys[type])}
    </button>
  );
}
