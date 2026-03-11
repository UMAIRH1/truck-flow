'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Notification } from '@/types';
import api from '@/lib/api';
import socketService from '@/lib/socket';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [rawNotifications, setRawNotifications] = useState<any[]>([]);
  const t = useTranslations('notifications');

  // Helper function to translate notification text
  // Remove useCallback to allow it to update when t changes
  const translateNotification = (notif: any) => {
    let translatedTitle = notif.title;
    let translatedMessage = notif.message;

    console.log('Translating notification:', {
      id: notif._id,
      titleKey: notif.titleKey,
      messageKey: notif.messageKey,
      params: notif.params,
      hasKeys: !!(notif.titleKey && notif.messageKey)
    });

    // If translation keys exist, use them
    if (notif.titleKey) {
      try {
        const key = notif.titleKey.replace('notifications.', '');
        translatedTitle = t(key);
        console.log(`Translated title key "${key}":`, translatedTitle);
      } catch (e) {
        console.log('Translation error for title:', notif.titleKey, e);
        // Fallback to original title if translation fails
        translatedTitle = notif.title;
      }
    }

    if (notif.messageKey) {
      try {
        const key = notif.messageKey.replace('notifications.', '');
        translatedMessage = t(key, notif.params || {});
        console.log(`Translated message key "${key}":`, translatedMessage);
      } catch (e) {
        console.log('Translation error for message:', notif.messageKey, e);
        // Fallback to original message if translation fails
        translatedMessage = notif.message;
      }
    }

    return {
      id: notif._id,
      type: notif.type,
      title: translatedTitle,
      message: translatedMessage,
      timestamp: new Date(notif.createdAt),
      read: notif.read,
      loadId: notif.loadId,
      routeId: notif.routeId,
      loadNumber: notif.loadNumber,
    };
  };

  // Re-translate notifications whenever language changes (t changes)
  useEffect(() => {
    if (rawNotifications.length > 0) {
      const translated = rawNotifications.map(notif => translateNotification(notif));
      setNotifications(translated);
    }
  }, [t, rawNotifications]);

  // Fetch notifications from backend
  const fetchNotifications = useCallback(async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('truckflow_token') : null;
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await api.getNotifications(50);
      if (response.success && response.data) {
        // Store raw notifications
        setRawNotifications(response.data);
        // Translate and set notifications
        const formattedNotifications = response.data.map((notif: any) => translateNotification(notif));
        setNotifications(formattedNotifications);
        setUnreadCount(formattedNotifications.filter((n: Notification) => !n.read).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize WebSocket connection
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('truckflow_token') : null;
    
    if (token) {
      // Fetch initial notifications
      fetchNotifications();

      // Connect to WebSocket
      socketService.connect(token);

      // Listen for new notifications
      const handleNotification = (notification: any) => {
        console.log('New notification received:', notification);
        
        // Translate the notification
        const translated = translateNotification(notification);
        
        // Show toast notification with translated text
        toast.info(translated.title, {
          description: translated.message,
          duration: 5000,
        });

        // Refetch all notifications from API
        fetchNotifications();
      };

      socketService.on('notification', handleNotification);

      // Cleanup
      return () => {
        socketService.off('notification', handleNotification);
      };
    } else {
      setIsLoading(false);
    }
  }, [fetchNotifications]);

  // Re-translate notifications when language changes
  useEffect(() => {
    const handleLanguageChange = () => {
      // Refresh notifications to get them re-translated
      fetchNotifications();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('localeChange', handleLanguageChange);
      return () => {
        window.removeEventListener('localeChange', handleLanguageChange);
      };
    }
  }, [fetchNotifications]);

  const addNotification = useCallback(
    (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
      const newNotification: Notification = {
        ...notification,
        id: `n${Date.now()}`,
        timestamp: new Date(),
        read: false,
      };
      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    },
    []
  );

  const markAsRead = useCallback(async (id: string) => {
    try {
      await api.markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await api.markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      await api.deleteNotification(id);
      setNotifications((prev) => {
        const notification = prev.find((n) => n.id === id);
        if (notification && !notification.read) {
          setUnreadCount((count) => Math.max(0, count - 1));
        }
        return prev.filter((n) => n.id !== id);
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

