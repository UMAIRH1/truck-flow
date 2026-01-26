"use client";

import React from "react";
import { Circle, MapPin, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";

interface LocationPickerProps {
  pickupValue: string;
  dropoffValue: string;
  onPickupChange: (value: string) => void;
  onDropoffChange: (value: string) => void;
  t: any;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  pickupValue,
  dropoffValue,
  onPickupChange,
  onDropoffChange,
  t,
}) => {
  const handleSwap = () => {
    onPickupChange(dropoffValue);
    onDropoffChange(pickupValue);
  };

  return (
    <div className="relative bg-white border border-[#CECECE] rounded-sm p-2 flex items-center gap-4 group transition-all duration-200 hover:border-[#0095FF]">
      {/* Left Icons & Connector */}
      <div className="flex flex-col items-center justify-between py-2 min-h-[80px]">
        <Circle className="h-4 w-4 text-[#0095FF]" />
        <div className="flex-1 w-[1px] border-l-2 border-dotted border-gray-300 my-1"></div>
        <MapPin className="h-4 w-4 text-[#0095FF]" />
      </div>

      {/* Middle Inputs */}
      <div className="flex-1 flex flex-col justify-between min-h-[80px]">
        <div className="relative">
          <Input
            value={pickupValue}
            onChange={(e) => onPickupChange(e.target.value)}
            placeholder={t("from")}
            className="border-none shadow-none focus-visible:ring-0 p-0 h-10 text-base placeholder:text-gray-400"
            required
          />
        </div>
        
        <div className="border-t border-[#CECECE] w-full"></div>
        
        <div className="relative">
          <Input
            value={dropoffValue}
            onChange={(e) => onDropoffChange(e.target.value)}
            placeholder={t("to")}
            className="border-none shadow-none focus-visible:ring-0 p-0 h-10 text-base placeholder:text-gray-400"
            required
          />
        </div>
      </div>

      {/* Right Swap Button */}
      <button
        type="button"
        onClick={handleSwap}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors group/swap"
        title="Swap locations"
      >
        <ArrowUpDown className="h-5 w-5 text-black group-hover/swap:text-[#0095FF] transition-colors" />
      </button>
    </div>
  );
};
