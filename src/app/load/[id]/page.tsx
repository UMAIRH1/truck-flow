"use client";

import { useParams } from "next/navigation";
import { Header, MobileLayout } from "@/components/layout";
import { useLoads } from "@/contexts/LoadContext";
import { Clock, Check, BusFront, ArrowDownLeft, ArrowUpRight, X } from "lucide-react";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { ASSETS } from "@/lib/assets";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { useTranslations } from "next-intl";

export default function LoadStatusPage() {
  const params = useParams();
  const { getLoadById } = useLoads();
  const t = useTranslations("loadStatus");
  const tCommon = useTranslations("common");

  const load = getLoadById(params.id as string);

  if (!load) {
    return (
      <>
        <div className="block md:hidden">
          <MobileLayout showFAB={false}>
            <Header title={t("title")} showBack />
            <div className="px-4 py-8 text-center text-gray-500">{t("loadNotFound")}</div>
          </MobileLayout>
        </div>
        <div className="hidden md:block">
          <Header title={t("title")} showBack />
          <div className="px-4 py-8 text-center text-gray-500">{t("loadNotFound")}</div>
        </div>
      </>
    );
  }

  const timeline = load.timeline || [];

  const formatDateTime = (date: Date) => {
    const d = new Date(date);
    return {
      date: d.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }),
      time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    };
  };

  const content = (
    <div className="px-4 py-4 space-y-4">
      <div className="bg-(--color-primary-yellow-dark) rounded-2xl p-4">
        <div className=" mb-4 flex items-center justify-center">
          <OptimizedImage src={ASSETS.images.icons.truck} alt="Load Status" width={200} height={100} />
        </div>
        <div className="flex items-center justify-between">
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
                {tCommon("today")} / {load.loadingTime}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Icon src={ASSETS.images.icons.share} className="h-3 w-3" />
              <span>{load.loadWeight} KG</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <ArrowDownLeft className="h-3 w-3 text-(--color-primary-gray)" />
              <span className="text-(--color-dark-gray)">
                {tCommon("from")}: {load.pickupLocation}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <ArrowUpRight className="h-3 w-3 text-(--color-primary-gray)" />
              <span className="text-(--color-dark-gray)">
                {tCommon("to")}: {load.dropoffLocation}
              </span>
            </div>
          </div>
          <div className="text-right flex flex-col justify-end items-start">
            <Badge className="px-4 bg-[#0D80F2] text-white self-end text-sm rounded-md font-normal">{t("moreInfo")}</Badge>
            <span className="font-bold">
              {tCommon("price")} ${load.clientPrice.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
      <div className="text-black">
        <h3 className="font-medium text-xl">
          {t("driver")} | {load.assignedDriver?.name || t("unassigned")}
        </h3>
        <p className="text-xs text-(--color-gray-light) font-normal mt-1">100 km | 2 hours | {load.loadWeight} kg</p>
      </div>
      <div>
        <div className="space-y-">
          {timeline.map((item, index) => {
            const { date, time } = formatDateTime(item.date);
            const isCompleted = item.completed;

            return (
              <div key={index} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isCompleted ? "bg-green-500" : "bg-(--color-primary-yellow-dark)"}`}>
                    {isCompleted ? <Check className="h-4 w-4 text-white" /> : <X className="h-4 w-4 text-white" />}
                  </div>
                  {index < timeline.length - 1 && <div className="w-0.5 h-8 bg-gray-200 mt-1" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm text-black">{item.status}</p>
                  <p className="text-xs font-normal text-(--color-button-table)">
                    {date} | {time}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="block md:hidden">
        <MobileLayout showFAB={false}>
          <Header title={t("title")} showBack />
          <div className="max-w-md mx-auto">{content}</div>
        </MobileLayout>
      </div>
      <div className="hidden md:block">
        <Header title={t("title")} showBack />
        <div className="max-w-7xl mx-auto">{content}</div>
      </div>
    </>
  );
}
