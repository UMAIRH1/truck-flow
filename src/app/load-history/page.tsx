"use client";

import React, { useState } from "react";
import { Header, MobileLayout } from "@/components/layout";
import { FilterTabs, DateFilter, LoadCard } from "@/components/shared";
import { useLoads } from "@/contexts/LoadContext";
import { useTranslations } from "next-intl";

export default function LoadHistoryPage() {
  const { loads } = useLoads();
  const [activeTab, setActiveTab] = useState("completed");
  const [dateFilter, setDateFilter] = useState<Date | undefined>();
  const t = useTranslations();

  const tabs = [
    { id: "completed", label: t("tabs.completed") },
    { id: "rejected", label: t("tabs.rejected") },
    { id: "dispute", label: t("tabs.dispute") },
  ];

  const filteredLoads = loads.filter((load) => {
    const matchesStatus = load.status === activeTab;
    const loadDate = load.loadingDate ? new Date(load.loadingDate) : null;
    const matchesDate = !dateFilter || (loadDate && !isNaN(loadDate.getTime()) && loadDate.toDateString() === dateFilter.toDateString());
    return matchesStatus && matchesDate;
  });

  const content = (
    <div className="px-4 py-4 space-y-4">
      <DateFilter value={dateFilter} onChange={setDateFilter} />
      <FilterTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="space-y-3">
        {filteredLoads.length === 0 ? <div className="text-center py-8 text-gray-500">{t("common.noLoadsFound")}</div> : filteredLoads.map((load) => <LoadCard key={load.id} load={load} />)}
      </div>
    </div>
  );

  return (
    <>
      <div className="block md:hidden">
        <MobileLayout>
          <Header title={t("header.loadHistory")} showBack />
          <div className="max-w-md mx-auto">{content}</div>
        </MobileLayout>
      </div>
      <div className="hidden md:block">
        <MobileLayout>
          <Header title={t("header.loadHistory")} showBack />
          <div className="max-w-7xl mx-auto">{content}</div>
        </MobileLayout>
      </div>
    </>
  );
}
