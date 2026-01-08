'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Notification, NotificationType } from '@/types';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Mock notifications
const mockNotifications: Notification[] = [
  {
    id: 'n1',
    type: 'load_accepted',
    title: 'Load has been accepted',
    message: 'Ema watson has accepted your load request with the price you sent.',
    timestamp: new Date(Date.now() - 9 * 60 * 1000), // 9 min ago
    read: false,
  },
  {
    id: 'n2',
    type: 'load_uploaded',
    title: 'New load uploaded',
    message: 'A new load has been recently uploaded by you with a 3 days delivery timeline.',
    timestamp: new Date(Date.now() - 20 * 60 * 1000), // 20 min ago
    read: false,
  },
  {
    id: 'n3',
    type: 'status_updated',
    title: 'Load status has been updated',
    message: 'Your partner - Watson just delivered the load. And it is now in next phase.',
    timestamp: new Date(Date.now() - 35 * 60 * 1000), // 35 min ago
    read: true,
  },
  {
    id: 'n4',
    type: 'load_uploaded',
    title: 'New load uploaded',
    message: 'A new load has been recently uploaded by you with a 7 days delivery timeline.',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    read: true,
  },
  {
    id: 'n5',
    type: 'load_uploaded',
    title: 'New load uploaded',
    message: 'A new load has been recently uploaded by you with a 7 days delivery timeline.',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    read: true,
  },
  {
    id: 'n6',
    type: 'load_accepted',
    title: 'Load has been accepted',
    message: 'Ema watson has accepted your load request with the price you sent.',
    timestamp: new Date(Date.now() - 25 * 60 * 60 * 1000), // 1 day ago
    read: true,
  },
];

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = useCallback(
    (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
      const newNotification: Notification = {
        ...notification,
        id: `n${Date.now()}`,
        timestamp: new Date(),
        read: false,
      };
      setNotifications((prev) => [newNotification, ...prev]);
    },
    []
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
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
