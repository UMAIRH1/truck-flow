"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Header, MobileLayout } from "@/components/layout";
import { useLoads } from "@/contexts/LoadContext";
import { MapPin, Navigation } from "lucide-react";
import { useTranslations } from "next-intl";

export default function MapViewPage() {
  const params = useParams();
  const router = useRouter();
  const { getLoadById, updateLoadStatus } = useLoads();
  const t = useTranslations("map");

  const load = getLoadById(params.id as string);

  const handleAccept = () => {
    if (load) {
      updateLoadStatus(load.id, "accepted");
      router.push("/my-loads");
    }
  };

  const handleDecline = () => {
    if (load) {
      updateLoadStatus(load.id, "rejected");
      router.push("/my-loads");
    }
  };

  if (!load) {
    return (
      <MobileLayout showFAB={true}>
        <Header title={t("title")} showBack />
        <div className="px-4 py-8 text-center text-gray-500">{t("loadNotFound")}</div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout showFAB={true} showBottomNav={true}>
      <Header title={t("title")} showBack />

      <div className="flex flex-col h-[calc(100vh-60px)]">
        {/* Action Buttons */}
        <div className="flex gap-2 p-4">
          <button onClick={handleAccept} className="flex-1 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors">
            ✓ {t("accept")}
          </button>
          <button onClick={handleDecline} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors">
            ✕ {t("decline")}
          </button>
        </div>

        {/* Map Placeholder */}
        <div className="flex-1 bg-gray-200 relative">
          {/* This would be replaced with an actual map component */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">{t("title")}</p>
              <p className="text-sm text-gray-400 mt-2">
                {load.pickupLocation} → {load.dropoffLocation}
              </p>
            </div>
          </div>

          {/* Route Visualization Placeholder */}
          <div className="absolute inset-4 border-2 border-dashed border-blue-300 rounded-xl opacity-50" />

          {/* Markers */}
          <div className="absolute top-1/4 left-1/4 p-2 bg-green-500 rounded-full">
            <MapPin className="h-4 w-4 text-white" />
          </div>
          <div className="absolute bottom-1/4 right-1/4 p-2 bg-red-500 rounded-full">
            <MapPin className="h-4 w-4 text-white" />
          </div>

          {/* Navigation Button */}
          <button className="absolute bottom-4 right-4 p-4 bg-blue-500 rounded-full shadow-lg hover:bg-blue-600 transition-colors">
            <Navigation className="h-6 w-6 text-white" />
          </button>
        </div>

        {/* Distance Info */}
        <div className="p-4 bg-white border-t flex items-center justify-center gap-8">
          <div className="text-center">
            <p className="text-sm text-gray-500">{t("distance")}</p>
            <p className="font-semibold">100 KM</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">{t("approximateTime")}</p>
            <p className="font-semibold">2 {t("hours")}</p>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
