"use client";

import React, { useState, useCallback, useEffect } from "react";
import { GoogleMap, LoadScript, DirectionsRenderer, Marker } from "@react-google-maps/api";
import { MapPin, Navigation, Clock, TrendingUp, Locate, AlertCircle, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const libraries: ("places" | "geometry")[] = ["places", "geometry"];

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

interface LiveNavigationMapProps {
  origin: string;
  destination: string;
  onNavigate?: () => void;
}

export function LiveNavigationMap({ origin, destination, onNavigate }: LiveNavigationMapProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [distance, setDistance] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [remainingDistance, setRemainingDistance] = useState<string>("");
  const [remainingTime, setRemainingTime] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<google.maps.DirectionsStep | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const [allSteps, setAllSteps] = useState<google.maps.DirectionsStep[]>([]);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const onLoadScript = useCallback(() => {
    setIsLoaded(true);
  }, []);

  // Get user's current location
  useEffect(() => {
    if (!isLoaded) return;

    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentLocation(newLocation);
          setIsTracking(true);

          // Center map on current location
          if (map) {
            map.panTo(newLocation);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          setError("Unable to get your location. Please enable location services.");
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    } else {
      setError("Geolocation is not supported by your browser");
    }
  }, [isLoaded, map]);

  // Calculate route
  useEffect(() => {
    if (!origin || !destination || !isLoaded || !window.google) return;

    const directionsService = new window.google.maps.DirectionsService();

    const request: google.maps.DirectionsRequest = {
      origin: currentLocation || origin,
      destination: destination,
      travelMode: window.google.maps.TravelMode.DRIVING,
      provideRouteAlternatives: false,
    };

    directionsService.route(request, (result, status) => {
      setLoading(false);
      if (status === window.google.maps.DirectionsStatus.OK && result) {
        setDirections(result);
        const route = result.routes[0];
        if (route && route.legs[0]) {
          const leg = route.legs[0];
          setDistance(leg.distance?.text || "");
          setDuration(leg.duration?.text || "");
          setRemainingDistance(leg.distance?.text || "");
          setRemainingTime(leg.duration?.text || "");
          
          // Get all steps
          if (leg.steps) {
            setAllSteps(leg.steps);
            setCurrentStep(leg.steps[0]);
          }
        }
      } else {
        setError("Could not calculate route. Please check the addresses.");
        console.error("Directions request failed:", status);
      }
    });
  }, [origin, destination, isLoaded, currentLocation]);

  const handleNavigate = () => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=driving`;
    window.open(url, "_blank");
    if (onNavigate) onNavigate();
  };

  const centerOnCurrentLocation = () => {
    if (currentLocation && map) {
      map.panTo(currentLocation);
      map.setZoom(16);
    }
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
          center={currentLocation || { lat: 37.9838, lng: 23.7275 }}
          zoom={currentLocation ? 16 : 8}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
            zoomControl: true,
            disableDefaultUI: false,
          }}
        >
          {directions && <DirectionsRenderer directions={directions} />}
          {currentLocation && (
            <Marker
              position={currentLocation}
              icon={{
                path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
                scale: 8,
                fillColor: "#4285F4",
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 2,
              }}
            />
          )}
        </GoogleMap>

        {/* Current Step Instruction */}
        {!loading && !error && currentStep && (
          <div className="absolute top-4 left-4 right-4 bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Navigation className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <p 
                  className="text-sm font-medium text-gray-900"
                  dangerouslySetInnerHTML={{ __html: currentStep.instructions }}
                />
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {currentStep.distance?.text}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {currentStep.duration?.text}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trip Info Card */}
        {!loading && !error && remainingDistance && remainingTime && (
          <div className="absolute top-24 left-4 right-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs opacity-90">Remaining</p>
                <p className="text-2xl font-bold">{remainingTime}</p>
                <p className="text-sm opacity-90">{remainingDistance}</p>
              </div>
              <Button 
                onClick={() => setShowSteps(!showSteps)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                {showSteps ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        )}

        {/* All Steps List */}
        {showSteps && allSteps.length > 0 && (
          <div className="absolute top-44 left-4 right-4 bg-white rounded-xl shadow-lg max-h-64 overflow-y-auto">
            <div className="p-4 border-b sticky top-0 bg-white">
              <h3 className="font-semibold text-sm">Turn-by-Turn Directions</h3>
            </div>
            <div className="divide-y">
              {allSteps.map((step, index) => (
                <div key={index} className="p-3 hover:bg-gray-50">
                  <div className="flex items-start gap-3">
                    <div className="bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p 
                        className="text-sm text-gray-900"
                        dangerouslySetInnerHTML={{ __html: step.instructions }}
                      />
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span>{step.distance?.text}</span>
                        <span>•</span>
                        <span>{step.duration?.text}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute bottom-4 left-4 right-4 space-y-2">
          {/* Center on Location Button */}
          {isTracking && (
            <Button
              onClick={centerOnCurrentLocation}
              className="w-full bg-white text-gray-900 hover:bg-gray-100 shadow-lg"
            >
              <Locate className="h-4 w-4 mr-2" />
              Center on My Location
            </Button>
          )}

          {/* Open in Google Maps */}
          <Button 
            onClick={handleNavigate} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
          >
            <Navigation className="h-4 w-4 mr-2" />
            Open in Google Maps
          </Button>

          {/* Destination Info */}
          <div className="bg-red-500 text-white rounded-lg p-3 shadow-lg">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <div className="flex-1">
                <p className="text-xs opacity-90">Destination</p>
                <p className="font-semibold text-sm">{destination}</p>
              </div>
            </div>
          </div>
        </div>

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
          <div className="absolute top-4 left-4 right-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Location Tracking Indicator */}
        {isTracking && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            Live
          </div>
        )}
      </div>
    </LoadScript>
  );
}
