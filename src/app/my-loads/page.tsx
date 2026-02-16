"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Header, MobileLayout } from "@/components/layout";
import { DriverLoadCard, FilterTabs } from "@/components/shared";
import { useLoads } from "@/contexts/LoadContext";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

function MyLoadsContent() {
  const { loads, updateLoadStatus } = useLoads();
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("pending");
  const t = useTranslations();

  // Set active tab from URL query parameter
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['pending', 'accepted', 'rejected', 'completed'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Filter loads for this driver - only show loads assigned to them
  const driverLoads = loads.filter(
    (load) => load.assignedDriver?.name === user?.name || load.assignedDriver?.id === user?.id
  );

  const tabs = [
    { id: "pending", label: t("tabs.pending") },
    { id: "accepted", label: t("tabs.accepted") },
    { id: "rejected", label: t("tabs.rejected") },
    { id: "completed", label: t("tabs.completed") },
  ];

  const filteredLoads = driverLoads.filter((load) => {
    if (activeTab === "pending") return load.status === "pending";
    if (activeTab === "accepted") return load.status === "accepted" || load.status === "in-progress";
    if (activeTab === "rejected") return load.status === "rejected";
    if (activeTab === "completed") return load.status === "completed";
    return true;
  });

  const handleAccept = (loadId: string) => {
    updateLoadStatus(loadId, "accepted");
  };

  const handleDecline = (loadId: string) => {
    updateLoadStatus(loadId, "rejected");
  };

  const handleMapView = (loadId: string) => {
    router.push(`/map/${loadId}`);
  };

  const cards = filteredLoads.map((load) => (
    <DriverLoadCard
      key={load.id}
      load={load}
      showActions={activeTab === "pending"}
      onAccept={() => handleAccept(load.id)}
      onDecline={() => handleDecline(load.id)}
      onMapView={() => handleMapView(load.id)}
    />
  ));
  const noLoadsMessageMobile = <div className="text-center py-8 text-gray-500">{t("common.noLoadsFound")}</div>;
  const noLoadsMessageDesktop = (
    <div className="col-span-full text-center py-16 text-gray-500">
      <div className="text-lg font-medium mb-2">{t("common.noLoadsFound")}</div>
      <div className="text-sm">{t("driver.checkBackLater")}</div>
    </div>
  );

  return (
    <>
      <div className="block md:hidden">
        <MobileLayout showBottomNav={true} showFAB={true}>
          <Header title={t("header.myLoads")} showBack />
          <div className="px-4 py-4 max-w-md mx-auto space-y-4">
            <FilterTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="space-y-3 mt-6">{filteredLoads.length === 0 ? noLoadsMessageMobile : cards}</div>
          </div>
        </MobileLayout>
      </div>
      <div className="hidden md:block min-h-screen bg-gray-50">
        <MobileLayout showBottomNav={true} showFAB={true}>
          <Header title={t("header.myLoads")} showBack />
          <div className="px-6 py-8 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">{t("header.myLoads")}</h1>
              <div className="text-sm text-gray-600">
                {filteredLoads.length} {activeTab} {filteredLoads.length === 1 ? t("common.load") : t("common.loads")}
              </div>
            </div>
            <FilterTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">{filteredLoads.length === 0 ? noLoadsMessageDesktop : cards}</div>
          </div>
        </MobileLayout>
      </div>
    </>
  );
}

export default function MyLoadsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    }>
      <MyLoadsContent />
    </Suspense>
  );
}
