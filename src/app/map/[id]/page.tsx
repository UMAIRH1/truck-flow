"use client";

import React from "react";
import { useParams } from "next/navigation";
import { Header, MobileLayout } from "@/components/layout";
import { useLoads } from "@/contexts/LoadContext";
import { GoogleMapRoute, LiveNavigationMap } from "@/components/shared";
import { useTranslations } from "next-intl";

export default function MapViewPage() {
  const params = useParams();
  const { getLoadById } = useLoads();
  const t = useTranslations("map");

  const load = getLoadById(params.id as string);

  if (!load) {
    return (
      <MobileLayout showFAB={false}>
        <Header title={t("title")} showBack />
        <div className="px-4 py-8 text-center text-gray-500">{t("loadNotFound")}</div>
      </MobileLayout>
    );
  }

  // Use LiveNavigationMap for in-progress loads, regular map for others
  const isInProgress = load.status === "in-progress";

  const content = (
    <div className="h-[calc(100vh-60px)]">
      {isInProgress ? (
        <LiveNavigationMap
          origin={load.pickupLocation}
          destination={load.dropoffLocation}
        />
      ) : (
        <GoogleMapRoute
          origin={load.pickupLocation}
          destination={load.dropoffLocation}
        />
      )}
    </div>
  );

  return (
    <>
      <div className="block md:hidden">
        <MobileLayout showFAB={false}>
          <Header title={isInProgress ? "Live Navigation" : t("title")} showBack />
          {content}
        </MobileLayout>
      </div>
      <div className="hidden md:block">
        <Header title={isInProgress ? "Live Navigation" : t("title")} showBack />
        {content}
      </div>
    </>
  );
}
