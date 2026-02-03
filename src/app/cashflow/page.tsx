"use client";

import React, { useState } from "react";
import { Header, MobileLayout } from "@/components/layout";
import { FilterTabs, CashflowCard } from "@/components/shared";
import { mockCashflowData } from "@/components/data/data";
import { DollarSign } from "lucide-react";
import { useTranslations } from "next-intl";

export default function CashflowPage() {
  const [activeTab, setActiveTab] = useState("outstanding");
  const t = useTranslations();

  const tabs = [
    { id: "outstanding", label: t("tabs.outstanding") },
    { id: "overdue", label: t("tabs.overdue") },
    { id: "due-this-week", label: t("tabs.dueThisWeek") },
  ];
  const clientsTotal = mockCashflowData.filter((c) => c.type === "client").reduce((sum, c) => sum + c.amount, 0);
  const partnersTotal = mockCashflowData.filter((c) => c.type === "partner").reduce((sum, c) => sum + c.amount, 0);
  const filteredItems = mockCashflowData.filter((item) => {
    if (activeTab === "outstanding") return true;
    return item.status === activeTab;
  });
  const outstandingTotal = mockCashflowData.reduce((sum, c) => sum + c.amount, 0);
  const overdueTotal = mockCashflowData.filter((c) => c.status === "overdue").reduce((sum, c) => sum + c.amount, 0);
  const dueThisWeekTotal = mockCashflowData.filter((c) => c.status === "due-this-week").reduce((sum, c) => sum + c.amount, 0);

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
                <p className="text-xs font-normal mt-1">{clientsTotal.toLocaleString()}.00</p>
              </div>
            </div>
            <div className="flex justify-start items-center gap-2 bg-(--color-dangerous) text-white rounded-lg p-2 md:p-6">
              <DollarSign />
              <div>
                <p className="text-xs font-semibold">{t("cashflow.partnersCashOut")}</p>
                <p className="text-xs font-normal mt-1">{partnersTotal.toLocaleString()}.00</p>
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
            {filteredItems.map((item) => (
              <CashflowCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
