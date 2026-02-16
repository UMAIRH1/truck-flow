"use client";

import React from "react";
import { Truck, LogOut, Clock, MapPin, Package, BusFront, ArrowDownLeft, ArrowUpRight, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Load } from "@/types";
import { Button } from "../ui/button";
import { OptimizedImage } from "../ui/optimized-image";
import { ASSETS } from "@/lib/assets";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

interface DriverLoadCardProps {
  load: Load;
  showActions?: boolean;
  showStatusLabel?: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
  onMapView?: () => void;
  className?: string;
}

export function DriverLoadCard({ load, showActions = false, showStatusLabel = false, onAccept, onDecline, onMapView, className }: DriverLoadCardProps) {
  const t = useTranslations("load");
  const tDriver = useTranslations("driver");
  const tTabs = useTranslations("tabs");
  const router = useRouter();

  const formattedDate = new Date(load.loadingDate).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  // Get status label and color
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return { label: tTabs("pending"), color: "bg-yellow-500", textColor: "text-yellow-900" };
      case "accepted":
        return { label: tTabs("accepted"), color: "bg-green-500", textColor: "text-green-900" };
      case "rejected":
        return { label: tTabs("rejected"), color: "bg-red-500", textColor: "text-red-900" };
      case "in-progress":
        return { label: tTabs("inProgress"), color: "bg-blue-500", textColor: "text-blue-900" };
      case "completed":
        return { label: tTabs("completed"), color: "bg-gray-500", textColor: "text-gray-900" };
      default:
        return { label: status, color: "bg-gray-500", textColor: "text-gray-900" };
    }
  };

  const statusConfig = getStatusConfig(load.status);

  return (
    <div 
      onClick={() => router.push(`/load/${load.id}`)}
      className={cn("bg-yellow-400 rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow", className)}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="bg-(--color-blue-border) p-1.5 rounded-md">
            <BusFront className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-(--color-stat-gray) text-base">{load.clientName}</span>
        </div>
        <div className="flex items-center gap-2">
          {showStatusLabel && (
            <span className={cn(
              "px-3 py-1 rounded-full text-xs font-semibold",
              statusConfig.color,
              statusConfig.textColor
            )}>
              {statusConfig.label}
            </span>
          )}
          <span className="font-bold text-(--color-stat-gray) text-base">
            €{load.driverPrice || 0}
          </span>
        </div>
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
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
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
