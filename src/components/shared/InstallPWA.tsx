"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Check, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app was installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // If no prompt available, show instructions
      alert(
        "To install TruckFlow:\n\n" +
        "On Android/Chrome:\n" +
        "1. Tap the menu (⋮)\n" +
        "2. Tap 'Install app' or 'Add to Home screen'\n\n" +
        "On iOS/Safari:\n" +
        "1. Tap the share button (□↑)\n" +
        "2. Tap 'Add to Home Screen'\n\n" +
        "On Desktop:\n" +
        "1. Look for the install icon (⊕) in the address bar\n" +
        "2. Click 'Install'"
      );
      return;
    }

    setIsInstalling(true);

    try {
      // Show the install prompt
      await deferredPrompt.prompt();
      
      // Wait for the user's response
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setIsInstalled(true);
      } else {
        console.log('User dismissed the install prompt');
      }
      
      // Clear the deferredPrompt
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error installing PWA:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  // Don't show button if already installed
  if (isInstalled) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <Check className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="font-semibold text-green-900">App Installed</p>
            <p className="text-sm text-green-700">TruckFlow is installed on your device</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
          <Smartphone className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-blue-900 mb-1">Install TruckFlow App</p>
          <p className="text-sm text-blue-700">
            Install TruckFlow on your device for quick access and a better experience. 
            Works like a native app!
          </p>
        </div>
      </div>
      
      <Button
        onClick={handleInstallClick}
        disabled={isInstalling}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        <Download className="h-4 w-4 mr-2" />
        {isInstalling ? "Installing..." : "Install App"}
      </Button>
      
      <p className="text-xs text-blue-600 mt-2 text-center">
        Free • No app store required • Instant updates
      </p>
    </div>
  );
}
