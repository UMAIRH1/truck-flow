"use client";

import React, { useState } from "react";
import { Header, MobileLayout } from "@/components/layout";
import { FilterTabs, DateFilter, LoadCard } from "@/components/shared";
import { useLoads } from "@/contexts/LoadContext";

export default function LoadHistoryPage() {
  const { loads } = useLoads();
  const [activeTab, setActiveTab] = useState("completed");
  const [dateFilter, setDateFilter] = useState<Date | undefined>();

  const tabs = [
    { id: "completed", label: "Completed" },
    { id: "rejected", label: "Rejected" },
    { id: "dispute", label: "Dispute" },
  ];

  const filteredLoads = loads.filter((load) => {
    const matchesStatus = load.status === activeTab;
    const matchesDate = !dateFilter || new Date(load.loadingDate).toDateString() === dateFilter.toDateString();
    return matchesStatus && matchesDate;
  });

  const content = (
    <div className="px-4 py-4 space-y-4">
      <DateFilter value={dateFilter} onChange={setDateFilter} />
      <FilterTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="space-y-3">
        {filteredLoads.length === 0 ? <div className="text-center py-8 text-gray-500">No loads found</div> : filteredLoads.map((load) => <LoadCard key={load.id} load={load} />)}
      </div>
    </div>
  );

  return (
    <>
      <div className="block md:hidden">
        <MobileLayout>
          <Header title="Load History" showBack />
          <div className="max-w-md mx-auto">{content}</div>
        </MobileLayout>
      </div>
      <div className="hidden md:block">
        <Header title="Load History" showBack />
        <div className="max-w-7xl mx-auto">{content}</div>
      </div>
    </>
  );
}
