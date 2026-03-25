"use client";

import React, { useRef, useEffect, useState, useId } from "react";
import { Input } from "@/components/ui/input";
import { Map, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GooglePlacesInputProps {
  value: string;
  onChange: (value: string) => void;
  onCoordinatesChange?: (lat: number, lng: number) => void;
  onPlaceSelected?: () => void;
  placeholder?: string;
  onMapClick?: () => void;
  className?: string;
  required?: boolean;
}

export function GooglePlacesInput({
  value,
  onChange,
  onCoordinatesChange,
  onPlaceSelected,
  placeholder = "Search location...",
  onMapClick,
  className = "",
  required = false,
}: GooglePlacesInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isPlaceSelected, setIsPlaceSelected] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const uniqueId = useId();

  // Store callbacks in refs to avoid recreating autocomplete on every render
  const onChangeRef = useRef(onChange);
  const onCoordinatesChangeRef = useRef(onCoordinatesChange);
  const onPlaceSelectedRef = useRef(onPlaceSelected);

  // Update refs when callbacks change
  useEffect(() => {
    onChangeRef.current = onChange;
    onCoordinatesChangeRef.current = onCoordinatesChange;
    onPlaceSelectedRef.current = onPlaceSelected;
  }, [onChange, onCoordinatesChange, onPlaceSelected]);

  useEffect(() => {
    const checkGoogleMaps = () => {
      if (window.google?.maps?.places?.Autocomplete) {
        setIsLoaded(true);
        return true;
      }
      return false;
    };

    if (checkGoogleMaps()) return;

    const interval = setInterval(() => {
      if (checkGoogleMaps()) clearInterval(interval);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isLoaded || !inputRef.current || autocompleteRef.current) return;

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      types: ["geocode", "establishment"],
      fields: ["formatted_address", "geometry", "name"],
    });

    autocompleteRef.current = autocomplete;

    // This prevents the "Enter" key from submitting a form if the dropdown is open
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        const pacContainer = document.querySelectorAll(".pac-container");
        const isVisible = Array.from(pacContainer).some(
          (el) => window.getComputedStyle(el).display !== "none"
        );
        if (isVisible) e.preventDefault();
      }
    };

    const currentInput = inputRef.current;
    currentInput.addEventListener("keydown", handleKeyDown);

    const placeChangedListener = autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();

      if (!place.geometry || !place.geometry.location) {
        return;
      }

      const address = place.formatted_address || place.name || "";
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();

      setIsPlaceSelected(true);
      onChangeRef.current(address);

      if (onCoordinatesChangeRef.current) {
        onCoordinatesChangeRef.current(lat, lng);
      }
      if (onPlaceSelectedRef.current) {
        onPlaceSelectedRef.current();
      }
    });

    return () => {
      currentInput.removeEventListener("keydown", handleKeyDown);
      google.maps.event.removeListener(placeChangedListener);
      autocompleteRef.current = null;
    };
  }, [isLoaded]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (isPlaceSelected) setIsPlaceSelected(false);
    onChange(newValue);
  };

  return (
    <div className="relative flex items-center gap-2 w-full">
      <div className="relative flex-1">
        <Input
          id={uniqueId}
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className={`${className} ${
            isPlaceSelected ? "border-green-500 pr-10" : ""
          }`}
          required={required}
          autoComplete="off"
        />
        {isPlaceSelected && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 pointer-events-none">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        )}
      </div>
      {onMapClick && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onMapClick}
          className="shrink-0 h-10 w-10"
        >
          <Map className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
