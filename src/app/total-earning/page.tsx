"use client";

import { Header, MobileLayout } from "@/components/layout";
import { LineChart, QuarterlyChart } from "@/components/shared";
import { useLoads } from "@/contexts/LoadContext";
import { useEffect, useState } from "react";

export default function TotalEarningPage() {
  const { loads } = useLoads();
  const completedLoads = loads.filter((l) => l.status === "completed");
  const totalIncome = completedLoads.reduce((sum, load) => sum + load.clientPrice, 0);
  const totalExpense = completedLoads.reduce((sum, load) => sum + (load.driverPrice || 0) + (load.fuel || 0) + (load.tolls || 0) + (load.otherExpenses || 0), 0);
  const profit = totalIncome - totalExpense;
  const [metric, setMetric] = useState<string>("income");

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const m = params.get("metric");
      if (m) setMetric(m);
    } catch (e) {
      // ignore in non-browser environments
    }
  }, []);

  const metricTitle = metric === "expense" ? "Expense" : metric === "profit" ? "Profit" : "Income";
  const metricValue = metric === "expense" ? totalExpense : metric === "profit" ? profit : totalIncome;

  const quarterlyData = [
    { quarter: "Q1", value: 12000 },
    { quarter: "Q2", value: 7000 },
    { quarter: "Q3", value: 12000 },
    { quarter: "Q4", value: 3000 },
  ];

  return (
    <MobileLayout showFAB={false}>
      <Header title="Total Earning" showBack />
      <div className="px-4 lg:px-6 py-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-6">
            <LineChart trend="+5%" trendLabel="Last 3 Months" labels={["Oct", "Nov", "Dec"]} className="h-64 md:h-80 lg:h-96" />
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="text-sm text-gray-500">Total Completed Loads</h3>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-bold">{completedLoads.length}</span>
                <span className="text-sm text-green-500">This Year +12%</span>
              </div>

              <div className="mt-4">
                <QuarterlyChart data={quarterlyData} />
              </div>
            </div>
          </div>
          <aside className="lg:col-span-1 flex flex-col gap-4 lg:sticky lg:top-24">
            <div className="bg-(--color-yellow-light) text-(--color-stat-gray) rounded-xl p-6">
              <p className="text-sm">{metricTitle}</p>
              <p className="text-3xl font-bold mt-1">${metricValue.toLocaleString()}.00</p>
            </div>
            <div className="hidden lg:block bg-white rounded-2xl p-4 text-sm text-gray-500">Updated just now</div>
          </aside>
        </div>
      </div>
    </MobileLayout>
  );
}
