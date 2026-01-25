"use client";

import React, { useState } from "react";
import { Header, MobileLayout } from "@/components/layout";
import { DateFilter, LoadCard } from "@/components/shared";
import { useLoads } from "@/contexts/LoadContext";
import { useTranslations } from "next-intl";

export default function ActiveLoadsPage() {
  const { loads } = useLoads();
  const [dateFilter, setDateFilter] = useState<Date | undefined>();
  const t = useTranslations();

  const activeLoads = loads.filter((load) => load.status === "accepted" || load.status === "in-progress" || load.status === "pending");

  const filteredLoads = activeLoads.filter((load) => {
    if (!dateFilter) return true;
    return new Date(load.loadingDate).toDateString() === dateFilter.toDateString();
  });

  return (
    <MobileLayout showFAB={false}>
      <Header title={t("header.activeLoads")} showBack />
      <div className="px-4 lg:px-6 py-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-6">
          <aside className="lg:col-span-1">
            <DateFilter value={dateFilter} onChange={setDateFilter} />
          </aside>
          <div className="lg:col-span-2">
            <div className="flex items-center justify-center md:justify-between mb-4">
              <h2 className="hidden md:block font-semibold text-center text-gray-800">{t("header.activeLoads")}</h2>
              <div className="hidden md:block text-sm text-gray-600">
                {t("common.showing")} {filteredLoads.length} {t("common.loads")}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {filteredLoads.length === 0 ? (
                <div className="text-center py-8 text-gray-500">{t("common.noLoadsFound")}</div>
              ) : (
                filteredLoads.map((load) => (
                  <div key={load.id} className="w-full">
                    <LoadCard load={load} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
