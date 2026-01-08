'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/contexts/NotificationContext';
import Link from 'next/link';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  showNotification?: boolean;
  className?: string;
}

export function Header({ title, showBack = false, showNotification = true, className }: HeaderProps) {
  const router = useRouter();
  const { unreadCount } = useNotifications();

  return (
    <header className={cn('sticky top-0 z-40 bg-yellow-400 px-4 py-4', className)}>
      <div className="flex items-center justify-between max-w-md mx-auto">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 rounded-full hover:bg-yellow-500/50 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
        {showNotification && (
          <Link
            href="/notifications"
            className="relative p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Link>
        )}
      </div>
    </header>
  );
}
