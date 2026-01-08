"use client";

import React from "react";
import { useParams } from "next/navigation";
import { Header, MobileLayout } from "@/components/layout";
import { useLoads } from "@/contexts/LoadContext";
import { Truck, MapPin, Clock, Check } from "lucide-react";

export default function LoadStatusPage() {
  const params = useParams();
  const { getLoadById } = useLoads();

  const load = getLoadById(params.id as string);

  if (!load) {
    return (
      <MobileLayout showFAB={false}>
        <Header title="Load Status" showBack />
        <div className="px-4 py-8 text-center text-gray-500">Load not found</div>
      </MobileLayout>
    );
  }

  const timeline = load.timeline || [
    { status: "In progress", date: new Date("2025-12-18T12:00:00"), description: "" },
    { status: "Delivered", date: new Date("2025-12-20T12:00:00"), description: "" },
    { status: "Waiting for documents", date: new Date("2025-12-20T09:00:00"), description: "" },
    { status: "Unpaid", date: new Date("2025-12-20T10:00:00"), description: "" },
    { status: "Paid & Load Completed", date: new Date("2025-12-21T09:00:00"), description: "" },
  ];

  const formatDateTime = (date: Date) => {
    const d = new Date(date);
    return {
      date: d.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }),
      time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    };
  };

  return (
    <MobileLayout showFAB={false}>
      <Header title="Load Status" showBack />

      <div className="px-4 py-4 max-w-md mx-auto space-y-4">
        {/* Load Card */}
        <div className="bg-yellow-400 rounded-2xl p-4">
          {/* Truck Image */}
          <div className="bg-yellow-300 rounded-xl p-4 mb-4 flex items-center justify-center">
            <div className="w-full h-20 flex items-center justify-center">
              <Truck className="h-16 w-16" />
            </div>
          </div>

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <Truck className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold">{load.clientName}</span>
            </div>
            <div className="text-right text-xs text-gray-700">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Today / {load.loadingTime}</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Truck className="h-3 w-3" />
                <span>{load.loadWeight} KG</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">↖</span>
                <span>From: {load.pickupLocation}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">↘</span>
                <span>To: {load.dropoffLocation}</span>
              </div>
            </div>
            <button className="px-4 py-2 bg-blue-500 text-white text-sm rounded-full font-medium">More Info</button>
          </div>

          <div className="text-right mt-2">
            <span className="font-bold">Price ${load.clientPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Driver Info */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold">Driver | {load.assignedDriver?.name || "Unassigned"}</h3>
          <p className="text-sm text-gray-500 mt-1">100 km | 2 hours | {load.loadWeight} kg</p>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="space-y-4">
            {timeline.map((item, index) => {
              const { date, time } = formatDateTime(item.date);
              const isCompleted = index < timeline.length;

              return (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isCompleted ? "bg-green-500" : "bg-gray-200"}`}>
                      {isCompleted && <Check className="h-4 w-4 text-white" />}
                    </div>
                    {index < timeline.length - 1 && <div className="w-0.5 h-8 bg-gray-200 mt-1" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.status}</p>
                    <p className="text-xs text-gray-500">
                      {date} | {time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
