"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";

interface GoogleMapsLoaderProps {
  children: React.ReactNode;
}

export function GoogleMapsLoader({ children }: GoogleMapsLoaderProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const locale = useLocale();

  useEffect(() => {
    // Check if already loaded
    if (window.google?.maps?.places) {
      setIsLoaded(true);
      return;
    }

    // Check if script is already in document
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      // Wait for it to load
      const checkLoaded = setInterval(() => {
        if (window.google?.maps?.places) {
          setIsLoaded(true);
          clearInterval(checkLoaded);
        }
      }, 100);
      return () => clearInterval(checkLoaded);
    }

    // Load Google Maps script
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error("Google Maps API key not found");
      setIsLoaded(true); // Allow fallback
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&loading=async&language=${locale}`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      console.log("✅ Google Maps loaded successfully");
      setIsLoaded(true);
    };

    script.onerror = () => {
      console.error("❌ Failed to load Google Maps");
      setIsLoaded(true); // Allow fallback
    };

    document.head.appendChild(script);

    return () => {
      // Don't remove script on unmount as it might be used elsewhere
    };
  }, []);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-sm text-gray-500">Loading maps...</div>
      </div>
    );
  }

  return <>{children}</>;
}
