"use client";

import { Header, MobileLayout } from "@/components/layout";
import { useNotifications } from "@/contexts/NotificationContext";
import { Bell } from "lucide-react";

export default function NotificationsPage() {
  const { notifications, markAsRead } = useNotifications();
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
    <>
      {/* Mobile view */}
      <div className="block md:hidden">
        <MobileLayout>
          <Header title="Notification" showBack />
          <div className="px-4 py-4 max-w-md mx-auto space-y-6">
            {Object.entries(groupedNotifications).map(([dateKey, items]) => (
              <div key={dateKey}>
                <div className="flex">
                  <h2 className="text-sm font-medium text-black mb-3">{dateKey}</h2>
                  <hr className="flex-1 border-t border-[#A0A0A0] mt-3 ml-3" />
                </div>

                <div className="space-y-3">
                  {items.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => markAsRead(notification.id)}
                      className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors "
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-3 border border-(--color-gray) rounded-full">
                          <Bell className="h-5 w-5 text-(--color-button-table)" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-sm">{notification.title}</h3>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-normal text-(--color-button-table)">{formatTime(notification.timestamp)}</span>
                              {!notification.read && <span className="w-2 h-2 bg-[#FF0000] rounded-full" />}
                            </div>
                          </div>
                          <p className="text-xs font-normal text-(--color-gray-light) mt-1">{notification.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </MobileLayout>
      </div>

      {/* Desktop view */}
      <div className="hidden md:block min-h-screen bg-gray-50">
        <Header title="Notifications" />
        <div className="max-w-7xl mx-auto py-12 px-8">
          {Object.entries(groupedNotifications).map(([dateKey, items]) => (
            <div key={dateKey} className="mb-8">
              <div className="flex items-center">
                <h2 className="text-sm font-medium text-black mr-4">{dateKey}</h2>
                <hr className="flex-1 border-t border-[#A0A0A0]" />
              </div>

              <div className="mt-4 space-y-4">
                {items.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 border border-(--color-gray) rounded-full">
                        <Bell className="h-5 w-5 text-(--color-button-table)" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-sm md:text-base">{notification.title}</h3>
                          <div className="flex items-center gap-3">
                            <span className="text-xs md:text-sm font-normal text-(--color-button-table)">{formatTime(notification.timestamp)}</span>
                            {!notification.read && <span className="w-2 h-2 bg-[#FF0000] rounded-full" />}
                          </div>
                        </div>
                        <p className="text-sm text-(--color-gray-light) mt-2">{notification.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
