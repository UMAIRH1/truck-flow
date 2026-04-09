import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import api from "./api"; // Assume backend API wrapper exists

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
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Create messaging instance conditionally (only works in browser)
let messaging = null;

export const requestNotificationPermission = async () => {
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
      
      // Get the FCM token (needs VAPID key)
      const token = await getToken(messaging, { 
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY 
      });
      
      if (token) {
        // Send token to backend to update User.fcmTokens
        await api.updateFcmToken(token, 'add');
        return token;
      }
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
  }
  return null;
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    try {
      if (messaging) {
        onMessage(messaging, (payload) => {
          resolve(payload);
        });
      }
    } catch (e) {
      console.error(e);
    }
  });

export { app, messaging };
