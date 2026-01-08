"use client";

import React, { useState } from "react";
import { Header, MobileLayout } from "@/components/layout";
import { DateFilter, LoadCard } from "@/components/shared";
import { useLoads } from "@/contexts/LoadContext";

export default function ActiveLoadsPage() {
  const { loads } = useLoads();
  const [dateFilter, setDateFilter] = useState<Date | undefined>();

  const activeLoads = loads.filter((load) => load.status === "accepted" || load.status === "in-progress" || load.status === "pending");

  const filteredLoads = activeLoads.filter((load) => {
    if (!dateFilter) return true;
    return new Date(load.loadingDate).toDateString() === dateFilter.toDateString();
  });

  return (
    <MobileLayout showFAB={false}>
      <Header title="Active Loads" showBack />

      <div className="px-4 py-4 max-w-md mx-auto space-y-4">
        <DateFilter value={dateFilter} onChange={setDateFilter} />

        <div className="space-y-3">
          {filteredLoads.length === 0 ? <div className="text-center py-8 text-gray-500">No active loads found</div> : filteredLoads.map((load) => <LoadCard key={load.id} load={load} />)}
        </div>
      </div>
    </MobileLayout>
  );
}
