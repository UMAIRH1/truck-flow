"use client";

import { useState } from "react";
import { Header, MobileLayout } from "@/components/layout";
import { LineChart, FinanceCard } from "@/components/shared";
import { DateField } from "@/components/ui/date-field";
import { useLoads } from "@/contexts/LoadContext";
import Link from "next/link";

export default function RevenuePage() {
  const { loads } = useLoads();
  const completedLoads = loads.filter((l) => l.status === "completed");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const filteredCompletedLoads = selectedDate ? completedLoads.filter((l) => new Date(l.loadingDate).toDateString() === selectedDate.toDateString()) : completedLoads;
  const totalIncome = filteredCompletedLoads.reduce((sum, load) => sum + load.clientPrice, 0);
  const totalExpense = filteredCompletedLoads.reduce((sum, load) => sum + (load.driverPrice || 0) + (load.fuel || 0) + (load.tolls || 0) + (load.otherExpenses || 0), 0);
  const profit = totalIncome - totalExpense;

  return (
    <MobileLayout>
      <Header title="Revenue" showBack />
      <div className="px-4 lg:px-6 py-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2">
            <LineChart trend="+5%" trendLabel="Last 3 Months" labels={["Oct", "Nov", "Dec"]} className="h-64 md:h-80 lg:h-96" />
          </div>
          <aside className="lg:col-span-1 flex flex-col gap-4 lg:sticky lg:top-24">
            <div>
              <DateField value={selectedDate} onChange={setSelectedDate} className="w-full" />
            </div>
            <div className="flex flex-col gap-3">
              {[
                { key: "income", label: "Income", value: totalIncome },
                { key: "expense", label: "Expense", value: totalExpense },
                { key: "profit", label: "Profit", value: profit },
              ].map((c) => (
                <Link href={`/total-earning?metric=${c.key}`} key={c.key}>
                  <FinanceCard label={c.label} value={c.value} trend="Today" variant="default" showArrow className="w-full" />
                </Link>
              ))}
            </div>
            <div className="hidden lg:block text-sm text-gray-500 mt-2">Updated just now</div>
          </aside>
        </div>
      </div>
    </MobileLayout>
  );
}
