"use client";

import { Header, MobileLayout } from "@/components/layout";
import { LineChart, QuarterlyChart } from "@/components/shared";
import { useLoads } from "@/contexts/LoadContext";
import { useEffect, useState } from "react";
import { aggregateMonthlyMetrics, computeTrend, aggregateQuarterlyMetrics, computeQuarterTrend, aggregateLastFourQuarters } from "@/lib/earnings";
import { useTranslations } from "next-intl";

export default function TotalEarningPage() {
  const { loads } = useLoads();
  const completedLoads = loads.filter((l) => l.status === "completed");
  const totalIncome = completedLoads.reduce((sum, load) => sum + load.clientPrice, 0);
  const totalExpense = completedLoads.reduce((sum, load) => sum + (load.driverPrice || 0), 0);
  const profit = totalIncome - totalExpense;
  const [metric, setMetric] = useState<string>("income");
  const t = useTranslations();

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const m = params.get("metric");
      if (m) setMetric(m);
    } catch (e) {
      // ignore in non-browser environments
    }
  }, []);

  const metricTitle = metric === "expense" ? t("revenue.expense") : metric === "profit" ? t("revenue.profit") : t("revenue.income");
  const metricValue = metric === "expense" ? totalExpense : metric === "profit" ? profit : totalIncome;
  // use a rolling 4-quarter view so quarters spanning last year are included
  const quarterlyData = aggregateLastFourQuarters(completedLoads, metric as "income" | "expense" | "profit");
  const quarterlyTrend = computeQuarterTrend(quarterlyData);
  const chartPoints = aggregateMonthlyMetrics(completedLoads, metric as "income" | "expense" | "profit", 3);
  const trend = computeTrend(chartPoints);

  return (
    <MobileLayout showFAB={false}>
      <Header title={t("header.totalEarning")} showBack />
      <div className="px-4 lg:px-6 py-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-6">
            <LineChart data={chartPoints} trend={trend} trendLabel="Last 3 Months" className="h-64 md:h-80 lg:h-96" />
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex flex-col justify-start text-(--color-light-black-border)">
                <h3 className="text-base font-medium">{t("earning.totalCompletedLoads")}</h3>
                <span className="text-3xl font-bold">{completedLoads.length}</span>
              </div>
              <div className="mt-4">
                <QuarterlyChart data={quarterlyData} trend={quarterlyTrend} trendLabel={t("earning.thisYear")} />
              </div>
            </div>
          </div>
          <aside className="lg:col-span-1 flex flex-col gap-4 lg:sticky lg:top-24">
            <div className="bg-(--color-yellow-light) text-(--color-stat-gray) rounded-xl p-6">
              <p className="text-sm">{metricTitle}</p>
              <p className="text-3xl font-bold mt-1">€{metricValue.toLocaleString()}.00</p>
            </div>
            <div className="hidden lg:block bg-white rounded-2xl p-4 text-sm text-gray-500">{t("common.updatedJustNow")}</div>
          </aside>
        </div>
      </div>
    </MobileLayout>
  );
}
