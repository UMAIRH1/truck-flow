"use client";

import React, { useState } from "react";
import { Header, MobileLayout } from "@/components/layout";
import { useAuth } from "@/contexts/AuthContext";
import { User, Shield, Bell, Lock, CreditCard, HelpCircle, LogOut, ChevronRight, Plus } from "lucide-react";
import Link from "next/link";

interface SettingsItem {
  icon: React.ReactNode;
  label: string;
  description?: string;
  href?: string;
  onClick?: () => void;
  badge?: boolean;
}

export default function SettingsPage() {
  const { user, logout, switchRole } = useAuth();
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);

  const accountItems: SettingsItem[] = [
    {
      icon: <User className="h-5 w-5" />,
      label: "Edit Profile",
      description: "You can update your info except username",
      href: "/settings/profile",
    },
    {
      icon: <Shield className="h-5 w-5" />,
      label: "Security",
      description: "Tap here to know about security",
      href: "/settings/security",
    },
    {
      icon: <Bell className="h-5 w-5" />,
      label: "Notifications",
      description: "Tap here to change notification setting",
      href: "/settings/notifications",
      badge: true,
    },
    {
      icon: <Lock className="h-5 w-5" />,
      label: "Privacy",
      description: "Tap here to know privacy setting",
      href: "/settings/privacy",
    },
  ];

  const actionItems: SettingsItem[] = [
    {
      icon: <CreditCard className="h-5 w-5" />,
      label: "Add Payment Methods",
      description: "Add your bank accounts",
      onClick: () => setShowPaymentMethods(true),
    },
    {
      icon: <HelpCircle className="h-5 w-5" />,
      label: "Help & Support",
      description: "Ask for your help & support easily",
      href: "/settings/support",
    },
    {
      icon: <LogOut className="h-5 w-5" />,
      label: "Sign Out",
      description: "Tap here to Sign out from this platform",
      onClick: logout,
    },
  ];

  const SettingsItemComponent = ({ item }: { item: SettingsItem }) => {
    const content = (
      <div className="flex items-center gap-4 p-4 bg-white rounded-xl hover:bg-gray-50 transition-colors">
        <div className="p-2 bg-yellow-400 rounded-xl">{item.icon}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{item.label}</span>
            {item.badge && <span className="w-2 h-2 bg-red-500 rounded-full" />}
          </div>
          {item.description && <p className="text-xs text-gray-500">{item.description}</p>}
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400" />
      </div>
    );

    if (item.href) {
      return <Link href={item.href}>{content}</Link>;
    }

    return (
      <button
        onClick={() => {
          console.log("[Settings] clicked", item.label);
          item.onClick && item.onClick();
        }}
        className="w-full text-left"
      >
        {content}
      </button>
    );
  };

  // Payment Methods Modal
  if (showPaymentMethods) {
    return (
      <MobileLayout showFAB={false}>
        <Header title="Settings" showBack />

        <div className="px-4 py-4 max-w-md mx-auto space-y-4">
          {/* Account Section - Faded */}
          <div className="opacity-50">
            <h2 className="text-sm font-semibold text-gray-500 mb-3">Account</h2>
            <div className="space-y-2">
              {accountItems.slice(0, 4).map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-white rounded-xl">
                  <div className="p-2 bg-yellow-400 rounded-xl">{item.icon}</div>
                  <div className="flex-1">
                    <span className="font-medium">{item.label}</span>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Methods Panel */}
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Payment Methods</h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-500 text-white rounded-xl">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Bank Account</p>
                    <p className="text-xs opacity-80">Link your bank</p>
                  </div>
                </div>
                <button className="px-4 py-1.5 bg-yellow-400 text-black text-sm rounded-full font-medium">Add Account</button>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-100 rounded-xl">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Credit/ Debit Card</p>
                    <p className="text-xs text-gray-500">Add your card details</p>
                  </div>
                </div>
                <button className="px-4 py-1.5 bg-blue-500 text-white text-sm rounded-full font-medium">Add Card</button>
              </div>
            </div>

            <p className="text-center text-sm text-gray-400 mt-4">Your transactions are secure</p>

            <button onClick={() => setShowPaymentMethods(false)} className="w-full mt-4 py-2 text-center text-gray-600 hover:text-gray-800">
              Close
            </button>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <Header title="Settings" showBack />

      <div className="px-4 py-4 max-w-md mx-auto space-y-6">
        {/* Role Switcher (for demo) */}
        <div className="bg-yellow-100 p-4 rounded-xl">
          <p className="text-sm text-gray-600 mb-2">Demo: Switch Role</p>
          <div className="flex gap-2">
            <button onClick={() => switchRole("manager")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${user?.role === "manager" ? "bg-yellow-400" : "bg-white"}`}>
              Manager
            </button>
            <button onClick={() => switchRole("driver")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${user?.role === "driver" ? "bg-yellow-400" : "bg-white"}`}>
              Driver
            </button>
          </div>
        </div>

        {/* Account Section */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 mb-3">Account</h2>
          <div className="space-y-2">
            {accountItems.map((item, index) => (
              <SettingsItemComponent key={index} item={item} />
            ))}
          </div>
        </div>

        {/* Actions Section */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 mb-3">Actions</h2>
          <div className="space-y-2">
            {actionItems.map((item, index) => (
              <SettingsItemComponent key={index} item={item} />
            ))}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
