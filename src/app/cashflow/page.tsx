"use client";

import React, { useState, useMemo } from "react";
import { Header, MobileLayout } from "@/components/layout";
import { FilterTabs, CashflowCard } from "@/components/shared";
import { DollarSign } from "lucide-react";
import { useTranslations } from "next-intl";
import { useLoads } from "@/contexts/LoadContext";
import { CashflowItem } from "@/types";

export default function CashflowPage() {
  const [activeTab, setActiveTab] = useState("outstanding");
  const t = useTranslations();
  const { loads } = useLoads();

  const tabs = [
    { id: "outstanding", label: t("tabs.outstanding") },
    { id: "overdue", label: t("tabs.overdue") },
    { id: "due-this-week", label: t("tabs.dueThisWeek") },
  ];

  // Convert loads to cashflow items
  const cashflowItems = useMemo(() => {
    const now = new Date();
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const items: CashflowItem[] = [];

    // Process completed loads (clients owe us money - Cash In)
    loads
      .filter((load) => load.status === "completed")
      .forEach((load) => {
        const expectedDate = new Date(load.expectedPayoutDate);
        const daysDiff = Math.floor((now.getTime() - expectedDate.getTime()) / (1000 * 60 * 60 * 24));
        
        let status: "outstanding" | "overdue" | "due-this-week" = "outstanding";
        let daysOverdue = 0;

        if (daysDiff > 0) {
          // Payment is overdue
          status = "overdue";
          daysOverdue = daysDiff;
        } else if (expectedDate <= oneWeekFromNow) {
          // Payment due within a week
          status = "due-this-week";
          daysOverdue = Math.abs(daysDiff);
        }

        // Add client payment (money coming in)
        items.push({
          id: load.id,
          type: "client",
          name: load.clientName,
          amount: load.clientPrice,
          since: load.completedAt || load.loadingDate,
          expected: expectedDate,
          status,
          daysOverdue,
        });

        // Add driver payment for the same completed load (money going out)
        if (load.assignedDriver && load.driverPrice && load.driverPrice > 0) {
          items.push({
            id: `driver-${load.id}`,
            type: "partner",
            name: load.assignedDriver.name,
            amount: load.driverPrice,
            since: load.completedAt || load.loadingDate,
            expected: expectedDate,
            status,
            daysOverdue,
          });
        }
      });

    return items;
  }, [loads]);

  // Calculate totals
  const clientsTotal = cashflowItems
    .filter((c) => c.type === "client")
    .reduce((sum, c) => sum + c.amount, 0);
    
  const partnersTotal = cashflowItems
    .filter((c) => c.type === "partner")
    .reduce((sum, c) => sum + c.amount, 0);

  // Filter items based on active tab
  const filteredItems = cashflowItems.filter((item) => {
    if (activeTab === "outstanding") return true;
    return item.status === activeTab;
  });

  const outstandingTotal = cashflowItems.reduce((sum, c) => sum + c.amount, 0);
  const overdueTotal = cashflowItems
    .filter((c) => c.status === "overdue")
    .reduce((sum, c) => sum + c.amount, 0);
  const dueThisWeekTotal = cashflowItems
    .filter((c) => c.status === "due-this-week")
    .reduce((sum, c) => sum + c.amount, 0);

  return (
    <MobileLayout showFAB={true} showBottomNav={true}>
      <Header title={t("header.cashflow")} showBack />
      <div className="max-sm:bg-(--color-yellow-light)">
        <div className="px-4 py-4 max-w-md mx-auto space-y-4 md:max-w-7xl md:px-8 md:py-12 rounded-t-2xl bg-white md:min-h-screen">
          <div className="flex gap-3 md:grid md:grid-cols-2 md:gap-6">
            <div className="flex justify-start items-center gap-2 bg-(--color-greenish) text-white rounded-lg px-2 py-4 md:p-6">
              <DollarSign />
              <div>
                <p className="text-[13px] font-bold">{t("cashflow.clientsCashIn")}</p>
                <p className="text-xs font-normal mt-1">€{clientsTotal.toLocaleString()}.00</p>
              </div>
            </div>
            <div className="flex justify-start items-center gap-2 bg-(--color-dangerous) text-white rounded-lg p-2 md:p-6">
              <DollarSign />
              <div>
                <p className="text-xs font-semibold">{t("cashflow.partnersCashOut")}</p>
                <p className="text-xs font-normal mt-1">€{partnersTotal.toLocaleString()}.00</p>
              </div>
            </div>
          </div>
          <FilterTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
          <div className="flex gap-4 px-2 md:justify-center bg-white border border-gray-100 py-2 rounded-md text-center">
            <span className="text-sm font-bold">€ {outstandingTotal.toLocaleString()}.00</span>
            <span className="text-[#E0E0E0]">|</span>
            <span className="text-sm text-(--color-cloud-bg)">€ {overdueTotal.toLocaleString()}.00</span>
            <span className="text-[#E0E0E0]">|</span>
            <span className="text-sm text-(--color-cloud-bg)">€ {dueThisWeekTotal.toLocaleString()}.00</span>
          </div>
          <div className="space-y-3 md:space-y-4">
            {filteredItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {t("common.noDataFound")}
              </div>
            ) : (
              filteredItems.map((item) => (
                <CashflowCard key={item.id} item={item} />
              ))
            )}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
