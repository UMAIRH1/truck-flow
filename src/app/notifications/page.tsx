"use client";

import React from "react";
import { Header, MobileLayout } from "@/components/layout";
import { useNotifications } from "@/contexts/NotificationContext";
import { Bell } from "lucide-react";

export default function NotificationsPage() {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();

  // Group notifications by date
  const groupedNotifications = notifications.reduce((groups, notification) => {
    const date = new Date(notification.timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let dateKey: string;
    if (date.toDateString() === today.toDateString()) {
      dateKey = "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateKey = "Yesterday";
    } else {
      dateKey = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }

    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(notification);
    return groups;
  }, {} as Record<string, typeof notifications>);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}min`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  return (
    <MobileLayout>
      <Header title="Notification" showBack />

      <div className="px-4 py-4 max-w-md mx-auto space-y-6">
        {Object.entries(groupedNotifications).map(([dateKey, items]) => (
          <div key={dateKey}>
            <h2 className="text-sm font-semibold text-gray-500 mb-3">{dateKey}</h2>
            <div className="space-y-3">
              {items.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  className={`bg-white rounded-xl p-4 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors ${!notification.read ? "border-l-4 border-l-yellow-400" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-100 rounded-full">
                      <Bell className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm">{notification.title}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">{formatTime(notification.timestamp)}</span>
                          {!notification.read && <span className="w-2 h-2 bg-red-500 rounded-full" />}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </MobileLayout>
  );
}
