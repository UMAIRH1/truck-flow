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
    const supported = await isSupported();
    if (!supported) {
      console.log('Push notifications are not supported in this browser.');
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      if (!messaging) {
        messaging = getMessaging(app);
      }
      
      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
      if (!vapidKey) {
        console.error('Missing VAPID Key in environment variables');
        return null;
      }

      // Get the FCM token (needs VAPID key)
      const token = await getToken(messaging, { vapidKey });
      
      if (token) {
        console.log('FCM Token generated successfully');
        // Send token to backend to update User.fcmTokens
        await api.updateFcmToken(token, 'add');
        return token;
      } else {
        console.warn('No FCM token received from getToken()');
      }
    } else {
      console.warn('Notification permission was not granted:', permission);
    }
  } catch (error: any) {
    console.error('Error getting notification permission:', error);
    // Don't toast error here to avoid annoying the user if they're on an unsupported browser
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
