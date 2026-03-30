"use client";

import React, { useState } from "react";
import { Circle, MapPin, ArrowUpDown } from "lucide-react";
import { GooglePlacesInput, GoogleMapPicker } from "@/components/shared";

interface LocationPickerProps {
  pickupValue: string;
  dropoffValue: string;
  onPickupChange: (value: string) => void;
  onDropoffChange: (value: string) => void;
  onPickupCoordinates?: (lat: number, lng: number) => void;
  onDropoffCoordinates?: (lat: number, lng: number) => void;
  pickupCoords?: { lat: number; lng: number } | null;
  dropoffCoords?: { lat: number; lng: number } | null;
  t: any;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  pickupValue,
  dropoffValue,
  onPickupChange,
  onDropoffChange,
  onPickupCoordinates,
  onDropoffCoordinates,
  pickupCoords,
  dropoffCoords,
  t,
}) => {
  const [showPickupMap, setShowPickupMap] = useState(false);
  const [showDropoffMap, setShowDropoffMap] = useState(false);

  const handleSwap = () => {
    // Swap addresses
    const oldPickup = pickupValue;
    onPickupChange(dropoffValue);
    onDropoffChange(oldPickup);

    // Swap coordinates
    if (onPickupCoordinates && onDropoffCoordinates) {
      if (dropoffCoords) {
        onPickupCoordinates(dropoffCoords.lat, dropoffCoords.lng);
      } else {
        // Clearing is important if the other didn't have coords
        // but this depends on implementation. For now let's just swap if both exist or one exists
      }

      if (pickupCoords) {
        onDropoffCoordinates(pickupCoords.lat, pickupCoords.lng);
      }
    }
  };

  const handlePickupLocationSelect = (location: { address: string; lat: number; lng: number }) => {
    onPickupChange(location.address);
    if (onPickupCoordinates) {
      onPickupCoordinates(location.lat, location.lng);
    }
    setShowPickupMap(false);
  };

  const handleDropoffLocationSelect = (location: { address: string; lat: number; lng: number }) => {
    onDropoffChange(location.address);
    if (onDropoffCoordinates) {
      onDropoffCoordinates(location.lat, location.lng);
    }
    setShowDropoffMap(false);
  };

  return (
    <div className="space-y-4">
      <div className="relative bg-white border border-[#CECECE] rounded-sm p-2 flex items-center gap-4 group transition-all duration-200 hover:border-[#0095FF]">
        {/* Left Icons & Connector */}
        <div className="flex flex-col items-center justify-between py-2 min-h-[80px]">
          <Circle className="h-4 w-4 text-[#0095FF]" />
          <div className="flex-1 w-[1px] border-l-2 border-dotted border-gray-300 my-1"></div>
          <MapPin className="h-4 w-4 text-[#0095FF]" />
        </div>

        {/* Middle Inputs with Google Places Autocomplete */}
        <div className="flex-1 flex flex-col justify-between min-h-[80px]">
          <div className="relative">
            <GooglePlacesInput
              value={pickupValue}
              onChange={onPickupChange}
              onCoordinatesChange={onPickupCoordinates}
              onMapClick={() => setShowPickupMap(!showPickupMap)}
              placeholder={t("pickupPlaceholder")}
              className="border-none shadow-none focus-visible:ring-0 p-0 h-10 text-base placeholder:text-gray-400"
              required
            />
          </div>
          
          <div className="border-t border-[#CECECE] w-full my-1"></div>
          
          <div className="relative">
            <GooglePlacesInput
              value={dropoffValue}
              onChange={onDropoffChange}
              onCoordinatesChange={onDropoffCoordinates}
              onMapClick={() => setShowDropoffMap(!showDropoffMap)}
              placeholder={t("dropoffPlaceholder")}
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

      {/* Pickup Map */}
      {showPickupMap && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 animate-in slide-in-from-top">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">📍 Select Pickup Location on Map</h3>
            <button
              type="button"
              onClick={() => setShowPickupMap(false)}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ✕ Close
            </button>
          </div>
          <GoogleMapPicker
            onLocationSelect={handlePickupLocationSelect}
            initialAddress={pickupValue}
            placeholder="Search pickup location..."
          />
        </div>
      )}

      {/* Dropoff Map */}
      {showDropoffMap && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 animate-in slide-in-from-top">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">📍 Select Dropoff Location on Map</h3>
            <button
              type="button"
              onClick={() => setShowDropoffMap(false)}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ✕ Close
            </button>
          </div>
          <GoogleMapPicker
            onLocationSelect={handleDropoffLocationSelect}
            initialAddress={dropoffValue}
            placeholder="Search dropoff location..."
          />
        </div>
      )}
    </div>
  );
};
