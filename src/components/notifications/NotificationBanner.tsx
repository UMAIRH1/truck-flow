'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Share, PlusSquare, X } from 'lucide-react';
import { requestNotificationPermission } from '@/lib/firebase';

export function NotificationBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');

  useEffect(() => {
    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Detect standalone mode (already added to home screen)
    const browserAny = window as any;
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || browserAny.navigator.standalone;
    setIsStandalone(!!isInStandaloneMode);

    // Get current permission status
    if (typeof Notification === 'undefined') {
      setPermission('unsupported');
      setShowBanner(true);
    } else {
      setPermission(Notification.permission);
      // Show banner if permission is default
      if (Notification.permission === 'default') {
        setShowBanner(true);
      }
    }
  }, []);

  const handleEnableNotifications = async () => {
    try {
      const token = await requestNotificationPermission();
      if (token) {
        setPermission('granted');
        setShowBanner(false);
      }
    } catch (error) {
      console.error('Failed to enable notifications:', error);
    }
  };

  if (!showBanner || (permission !== 'default' && permission !== 'unsupported')) return null;

  return (
    <div className="bg-white border-l-4 border-yellow-400 p-4 rounded-xl shadow-sm mb-6 animate-in fade-in slide-in-from-top duration-500">
      <div className="flex items-start justify-between">
        <div className="flex gap-4 w-full">
          <div className="bg-yellow-100 p-2 rounded-lg shrink-0">
            <Bell className="h-6 w-6 text-yellow-600" />
          </div>
          <div className="space-y-1 w-full">
            <h3 className="font-bold text-gray-900">Get Real-Time Alerts</h3>
            
            {isIOS && !isStandalone ? (
              <div className="text-sm text-gray-600 space-y-2">
                <p>To receive notifications on iPhone, you must first install the app:</p>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center bg-white border border-gray-200 rounded-full w-5 h-5 text-xs font-bold text-gray-600">1</span>
                    <span>Tap the <Share className="inline h-4 w-4 mx-1 text-blue-500" /> **Share** button below</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center bg-white border border-gray-200 rounded-full w-5 h-5 text-xs font-bold text-gray-600">2</span>
                    <span>Select **"Add to Home Screen"** <PlusSquare className="inline h-4 w-4 mx-1 text-gray-700" /></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center bg-white border border-gray-200 rounded-full w-5 h-5 text-xs font-bold text-gray-600">3</span>
                    <span>Open the app from your **Home Screen**</span>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-600">
                  Enable push notifications to get instant updates about new load assignments and route changes.
                </p>
                <button
                  onClick={handleEnableNotifications}
                  className="mt-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-2 px-6 rounded-lg transition-all transform active:scale-95 shadow-sm w-full md:w-auto"
                >
                  Enable Notifications
                </button>
              </>
            )}
          </div>
        </div>
        <button 
          onClick={() => setShowBanner(false)}
          className="text-gray-400 hover:text-gray-600 transition-colors shrink-0 p-1"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
