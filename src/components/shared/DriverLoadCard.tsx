"use client";

import React from "react";
import { Truck, LogOut, Clock, MapPin, Package, BusFront, ArrowDownLeft, ArrowUpRight, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Load } from "@/types";
import { Button } from "../ui/button";
import { OptimizedImage } from "../ui/optimized-image";
import { ASSETS } from "@/lib/assets";
import { useTranslations } from "next-intl";

interface DriverLoadCardProps {
  load: Load;
  showActions?: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
  onMapView?: () => void;
  className?: string;
}

export function DriverLoadCard({ load, showActions = false, onAccept, onDecline, onMapView, className }: DriverLoadCardProps) {
  const t = useTranslations("load");
  const tDriver = useTranslations("driver");

  const formattedDate = new Date(load.loadingDate).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className={cn("bg-yellow-400 rounded-2xl p-4 shadow-sm", className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="bg-(--color-blue-border) p-1.5 rounded-md">
            <BusFront className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-(--color-stat-gray) text-base">{load.clientName}</span>
        </div>
        <span className="font-bold text-(--color-stat-gray) text-base">
          {t("loadPrice")} ${load.clientPrice}
        </span>
      </div>
      <div className="flex justify-between items-end">
        <div className="space-y-2  mb-4 text-(--color-dark-gray) text-xs font-normal">
          <div className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            <span>
              {t("paymentTerms")}: {load.paymentTerms} {t("days")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            <span>
              {t("expectedPayoutDate")}: {new Date(load.expectedPayoutDate).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            <span>
              {t("loadWeight")}: {load.loadWeight} KG
            </span>
          </div>
          <div className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            <span>
              {formattedDate} | {load.loadingTime}
            </span>
          </div>
        </div>
        <div className=" flex items-center justify-end">
          <OptimizedImage src={ASSETS.images.icons.truck} alt="Vehicle" width={88} height={88} />
        </div>
      </div>

      <div className="flex-1 mb-4">
        <div className="flex items-center gap-2 text-[13px] text-(--color-dark-gray)">
          <ArrowDownLeft className="h-3 w-3 text-(--color-primary-gray)" />
          <span>
            {t("pickup")}: {load.pickupLocation}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[13px] text-(--color-dark-gray) mt-1">
          <ArrowUpRight className="h-3 w-3 text-(--color-primary-gray)" />
          <span>
            {t("delivery")}: {load.dropoffLocation}
          </span>
        </div>
      </div>

      {showActions && (
        <div className="flex items-center gap-2">
          <Button onClick={onMapView} className="flex-1 px-4 py-2 bg-(--color-blue-border) text-white text-sm rounded-md font-medium hover:bg-blue-600 transition-colors">
            <MapPin /> {tDriver("mapView")}
          </Button>
          <Button onClick={onDecline} className="flex-1 px-4 py-2 bg-(--color-dangerous) text-white text-sm rounded-md font-medium hover:bg-red-600 transition-colors">
            <X /> {tDriver("decline")}
          </Button>
          <Button onClick={onAccept} className="flex-1 px-4 py-2 bg-(--color-greenish) text-white text-sm rounded-md font-medium hover:bg-green-600 transition-colors">
            <Check /> {tDriver("accept")}
          </Button>
        </div>
      )}
    </div>
  );
}
