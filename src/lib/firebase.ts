import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported, Messaging } from "firebase/messaging";
import api from "./api";
import { toast } from "sonner";

const firebaseConfig = {
  apiKey: "AIzaSyDHX944D2Ix677XhgpGcphEbTgJfDyJeOE",
  authDomain: "truckflow-31de0.firebaseapp.com",
  projectId: "truckflow-31de0",
  storageBucket: "truckflow-31de0.firebasestorage.app",
  messagingSenderId: "4124889521",
  appId: "1:4124889521:web:e04ea3cbb7044fd6d3ed90",
  measurementId: "G-69QT8G4R2D"
};

// Initialize Firebase
const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Create messaging instance conditionally
let messaging: Messaging | null = null;

export const requestNotificationPermission = async () => {
  if (typeof window === 'undefined') return null;

  try {
    toast.info("Checking notification support...");
    const supported = await isSupported();
    if (!supported) {
      toast.error("Push notifications NOT supported in this browser.");
      return null;
    }

    toast.info("Requesting permission...");
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      toast.success("Permission GRANTED");
      
      if (!messaging) {
        messaging = getMessaging(app);
      }
      
      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
      if (!vapidKey) {
        toast.error("Error: NEXT_PUBLIC_FIREBASE_VAPID_KEY is missing in Amplify!");
        return null;
      }

      toast.info("Generating token (this may take a few seconds)...");
      
      // Try to get token with explicit service worker registration if possible
      const token = await getToken(messaging, { 
        vapidKey: vapidKey 
      });
      
      if (token) {
        toast.success("Token generated! Saving to backend...");
        await api.updateFcmToken(token, 'add');
        toast.success("Push notifications fully activated! ✅");
        return token;
      } else {
        toast.error("Token generation failed (returned empty).");
      }
    } else {
      toast.error(`Permission denied: ${permission}`);
    }
  } catch (error: any) {
    console.error('Error getting notification permission:', error);
    toast.error(`Fatal Error: ${error.message || 'Check browser console'}`);
  }
  return null;
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    if (typeof window === 'undefined') return;
    try {
      if (!messaging) {
        messaging = getMessaging(app);
      }
      if (messaging) {
        onMessage(messaging, (payload) => {
          resolve(payload);
        });
      }
    } catch (e) {
      console.error('Error in onMessageListener:', e);
    }
  });

export { app, messaging };
