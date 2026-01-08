"use client";

import React from "react";
import { Truck, Calendar, Clock, MapPin, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { Load } from "@/types";
interface DriverLoadCardProps {
  load: Load;
  showActions?: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
  onMapView?: () => void;
  className?: string;
}

export function DriverLoadCard({ load, showActions = false, onAccept, onDecline, onMapView, className }: DriverLoadCardProps) {
  const formattedDate = new Date(load.loadingDate).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className={cn("bg-yellow-400 rounded-2xl p-4 shadow-sm", className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Truck className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold">{load.clientName}</span>
        </div>
        <span className="text-lg font-bold">Load Price ${load.clientPrice}</span>
      </div>

      <div className="space-y-2 text-sm mb-4">
        <div className="flex items-center gap-2 text-gray-700">
          <Calendar className="h-4 w-4" />
          <span>Payment Terms: {load.paymentTerms} Days</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <Calendar className="h-4 w-4" />
          <span>Expected Payout Date: {new Date(load.expectedPayoutDate).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <Package className="h-4 w-4" />
          <span>Load Weight: {load.loadWeight} KG</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <Clock className="h-4 w-4" />
          <span>
            {formattedDate} | {load.loadingTime}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-xs text-gray-700">
            <MapPin className="h-3 w-3" />
            <span>Pickup: {load.pickupLocation}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-700 mt-1">
            <MapPin className="h-3 w-3" />
            <span>Delivery: {load.dropoffLocation}</span>
          </div>
        </div>
        <div className="w-16 h-12 bg-yellow-300 rounded-lg flex items-center justify-center">
          <Truck className="h-8 w-8" />
        </div>
      </div>

      {showActions && (
        <div className="flex items-center gap-2">
          <button onClick={onMapView} className="flex-1 px-4 py-2 bg-blue-500 text-white text-sm rounded-full font-medium hover:bg-blue-600 transition-colors">
            🗺 Map View
          </button>
          <button onClick={onDecline} className="flex-1 px-4 py-2 bg-red-500 text-white text-sm rounded-full font-medium hover:bg-red-600 transition-colors">
            ✕ Decline
          </button>
          <button onClick={onAccept} className="flex-1 px-4 py-2 bg-green-500 text-white text-sm rounded-full font-medium hover:bg-green-600 transition-colors">
            ✓ Accept
          </button>
        </div>
      )}
    </div>
  );
}
