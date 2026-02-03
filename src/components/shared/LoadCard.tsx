"use client";

import { ArrowDownLeft, ArrowUpRight, BusFront, Clock, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Load } from "@/types";
import Link from "next/link";
import { ASSETS } from "@/lib/assets";
import { Icon } from "../ui/icon";
import { useTranslations } from "next-intl";

interface LoadCardProps {
  load: Load;
  showStatus?: boolean;
  showDriver?: boolean;
  onClick?: () => void;
  className?: string;
  variant?: "default" | "compact";
}

export function LoadCard({ load, showStatus = true, showDriver = true, onClick, className, variant = "default" }: LoadCardProps) {
  const t = useTranslations("common");
  const formattedDate = new Date(load.loadingDate)
    .toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .replace(",", "");

  const formattedTime = load.loadingTime;

  const content = (
    <div className={cn("bg-(--color-primary-yellow-dark) rounded-xl p-3 shadow-sm", onClick && "cursor-pointer hover:bg-yellow-300 transition-colors", className)}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="bg-(--color-blue-border) p-1.5 rounded-md">
            <BusFront className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-(--color-stat-gray) text-base">{load.clientName}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-(--color-dark-gray)">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>
              {t("today")} / {formattedTime}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Icon src={ASSETS.images.icons.share} className="h-3 w-3" />
            <span>{load.loadWeight} KG</span>
          </div>
        </div>
      </div>

      <div className="flex items-end justify-end">
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2 text-xs">
            <ArrowDownLeft className="h-3 w-3 text-(--color-primary-gray)" />
            <span className="text-(--color-dark-gray)">
              {t("from")}: {load.pickupLocation}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <ArrowUpRight className="h-3 w-3 text-(--color-primary-gray)" />
            <span className="text-(--color-dark-gray)">
              {t("to")}: {load.dropoffLocation}
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="font-medium text-base text-(--color-stat-gray)">
            {t("price")} €{load.clientPrice.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );

  if (onClick) {
    return (
      <div onClick={onClick} className="block">
        {content}
      </div>
    );
  }

  return (
    <Link href={`/load/${load.id}`} className="block">
      {content}
    </Link>
  );
}
