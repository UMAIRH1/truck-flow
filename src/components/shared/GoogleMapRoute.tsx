"use client";

import React, { useState, useCallback, useEffect } from "react";
import { GoogleMap, LoadScript, DirectionsRenderer } from "@react-google-maps/api";
import { MapPin, Navigation, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const libraries: ("places" | "geometry")[] = ["places", "geometry"];

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = {
  lat: 37.9838,
  lng: 23.7275, // Athens, Greece
};

interface GoogleMapRouteProps {
  origin: string;
  destination: string;
  onNavigate?: () => void;
}

export function GoogleMapRoute({ origin, destination, onNavigate }: GoogleMapRouteProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [distance, setDistance] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const onLoadScript = useCallback(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!origin || !destination || !isLoaded || !window.google) return;

    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route(
      {
        origin: origin,
        destination: destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        setLoading(false);
        if (status === window.google.maps.DirectionsStatus.OK && result) {
          setDirections(result);
          const route = result.routes[0];
          if (route && route.legs[0]) {
            setDistance(route.legs[0].distance?.text || "");
            setDuration(route.legs[0].duration?.text || "");
          }
        } else {
          setError("Could not calculate route. Please check the addresses.");
          console.error("Directions request failed:", status);
        }
      }
    );
  }, [origin, destination, isLoaded]);

  const handleNavigate = () => {
    // Open Google Maps navigation
    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=driving`;
    window.open(url, "_blank");
    if (onNavigate) onNavigate();
  };

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  if (!apiKey) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <MapPin className="h-12 w-12 mx-auto mb-2" />
          <p>Google Maps API key not configured</p>
        </div>
      </div>
    );
  }

  return (
    <LoadScript 
      googleMapsApiKey={apiKey} 
      libraries={libraries}
      onLoad={onLoadScript}
    >
      <div className="relative w-full h-full">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={defaultCenter}
          zoom={8}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
            zoomControl: true,
          }}
        >
          {directions && <DirectionsRenderer directions={directions} />}
        </GoogleMap>

        {/* Info Card */}
        {!loading && !error && distance && duration && (
          <div className="absolute top-4 left-4 right-4 bg-white rounded-xl shadow-lg p-4 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500">Distance</p>
                  <p className="font-semibold">{distance}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-xs text-gray-500">Duration</p>
                  <p className="font-semibold">{duration}</p>
                </div>
              </div>
            </div>

            <Button onClick={handleNavigate} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              <Navigation className="h-4 w-4 mr-2" />
              Start Navigation
            </Button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Calculating route...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="absolute top-4 left-4 right-4 bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Location Labels */}
        {!loading && !error && (
          <div className="absolute bottom-4 left-4 right-4 space-y-2">
            <div className="bg-green-500 text-white rounded-lg p-3 shadow-lg">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <div className="flex-1">
                  <p className="text-xs opacity-90">From</p>
                  <p className="font-semibold text-sm">{origin}</p>
                </div>
              </div>
            </div>
            <div className="bg-red-500 text-white rounded-lg p-3 shadow-lg">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <div className="flex-1">
                  <p className="text-xs opacity-90">To</p>
                  <p className="font-semibold text-sm">{destination}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </LoadScript>
  );
}
