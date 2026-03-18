"use client";

import React, { useRef, useEffect, useState } from "react";
import { LoadScript } from "@react-google-maps/api";
import { Input } from "@/components/ui/input";
import { Map } from "lucide-react";
import { Button } from "@/components/ui/button";

const libraries: ("places" | "geometry")[] = ["places", "geometry"];

interface GooglePlacesInputProps {
  value: string;
  onChange: (value: string) => void;
  onCoordinatesChange?: (lat: number, lng: number) => void;
  placeholder?: string;
  onMapClick?: () => void;
  className?: string;
  required?: boolean;
}

function GooglePlacesInputInner({
  value,
  onChange,
  onCoordinatesChange,
  placeholder = "Search location...",
  onMapClick,
  className = "",
  required = false,
}: GooglePlacesInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!inputRef.current || !window.google) return;

    // Initialize Google Places Autocomplete
    autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
      types: ["geocode", "establishment"],
      fields: ["formatted_address", "geometry", "name"],
    });

    // Listen for place selection
    const listener = autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current?.getPlace();
      
      if (place && place.geometry && place.geometry.location) {
        const address = place.formatted_address || place.name || "";
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        onChange(address);
        
        if (onCoordinatesChange) {
          onCoordinatesChange(lat, lng);
        }
      }
    });

    return () => {
      if (listener) {
        google.maps.event.removeListener(listener);
      }
    };
  }, [onChange, onCoordinatesChange]);

  return (
    <div className="relative flex items-center gap-2">
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={className}
        required={required}
        autoComplete="off"
      />
      {onMapClick && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onMapClick}
          className="h-10 px-3 flex-shrink-0"
          title="Pick from map"
        >
          <Map className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

export function GooglePlacesInput(props: GooglePlacesInputProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  if (!apiKey) {
    return (
      <div className="relative flex items-center gap-2">
        <Input
          type="text"
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          placeholder={props.placeholder}
          className={props.className}
          required={props.required}
        />
        {props.onMapClick && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={props.onMapClick}
            className="h-10 px-3 flex-shrink-0"
          >
            <Map className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <LoadScript googleMapsApiKey={apiKey} libraries={libraries}>
      <GooglePlacesInputInner {...props} />
    </LoadScript>
  );
}
