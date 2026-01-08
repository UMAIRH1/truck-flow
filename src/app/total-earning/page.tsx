"use client";

import React from "react";
import { Header, MobileLayout } from "@/components/layout";
import { LineChart, QuarterlyChart } from "@/components/shared";
import { useLoads } from "@/contexts/LoadContext";

export default function TotalEarningPage() {
  const { loads } = useLoads();

  const completedLoads = loads.filter((l) => l.status === "completed");
  const totalIncome = completedLoads.reduce((sum, load) => sum + load.clientPrice, 0);

  const quarterlyData = [
    { quarter: "Q1", value: 12000 },
    { quarter: "Q2", value: 7000 },
    { quarter: "Q3", value: 12000 },
    { quarter: "Q4", value: 3000 },
  ];

  return (
    <MobileLayout showFAB={false}>
      <Header title="Total Earning" showBack />

      <div className="px-4 py-4 max-w-md mx-auto space-y-6">
        {/* Chart */}
        <LineChart trend="+5%" trendLabel="Last 3 Months" labels={["Oct", "Nov", "Dec"]} />

        {/* Income Card */}
        <div className="bg-yellow-400 rounded-2xl p-6">
          <p className="text-sm text-gray-700">Income</p>
          <p className="text-3xl font-bold mt-1">${totalIncome.toLocaleString()}.00</p>
        </div>

        {/* Completed Loads Stats */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm text-gray-500">Total Completed Loads</h3>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold">{completedLoads.length > 0 ? 730 : 0}</span>
            <span className="text-sm text-green-500">This Year +12%</span>
          </div>

          <div className="mt-4">
            <QuarterlyChart data={quarterlyData} />
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
