"use client";

import React, { useState } from "react";
import { Header, MobileLayout } from "@/components/layout";
import { LineChart, FinanceCard } from "@/components/shared";
import { useLoads } from "@/contexts/LoadContext";
import { Calendar, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function RevenuePage() {
  const { loads } = useLoads();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Calculate finances
  const completedLoads = loads.filter((l) => l.status === "completed");
  const totalIncome = completedLoads.reduce((sum, load) => sum + load.clientPrice, 0);
  const totalExpense = completedLoads.reduce((sum, load) => sum + (load.driverPrice || 0) + (load.fuel || 0) + (load.tolls || 0) + (load.otherExpenses || 0), 0);
  const profit = totalIncome - totalExpense;

  return (
    <MobileLayout>
      <Header title="Revenue" showBack />

      <div className="px-4 py-4 max-w-md mx-auto space-y-4">
        {/* Chart */}
        <LineChart trend="+5%" trendLabel="Last 3 Months" labels={["Oct", "Nov", "Dec"]} />

        {/* Date Selector */}
        <div className="flex items-center justify-center gap-3">
          <button className="px-6 py-2 bg-gray-100 rounded-full text-sm font-medium">Today</button>
          <button className="p-3 bg-gray-900 rounded-xl">
            <Calendar className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Finance Cards */}
        <div className="space-y-3">
          <Link href="/total-earning">
            <FinanceCard label="Income" value={totalIncome} trend="Today" variant="default" showArrow />
          </Link>

          <FinanceCard label="Expense" value={totalExpense} trend="Today" variant="default" showArrow />

          <FinanceCard label="Profit" value={profit} trend="Today" variant="profit" showArrow />
        </div>
      </div>
    </MobileLayout>
  );
}
