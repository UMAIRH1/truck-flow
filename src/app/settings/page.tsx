"use client";

import React, { useState } from "react";
import { Header, MobileLayout } from "@/components/layout";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronRight, BusFront } from "lucide-react";
import Link from "next/link";
import Modal from "@/app/settings/_components/modal";
import { useTranslations } from "next-intl";

interface SettingsItem {
  label: string;
  description?: string;
  href?: string;
  onClick?: () => void;
  badge?: boolean;
}

export default function SettingsPage() {
  const { logout } = useAuth();
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const t = useTranslations("settings");

  const accountItems: SettingsItem[] = [
    { label: t("editProfile"), description: t("editProfileDesc"), href: "/settings/profile" },
    {
      label: t("security"),
      description: t("securityDesc"),
      href: "/settings/security",
    },
    { label: t("notifications"), description: t("notificationsDesc"), href: "/notifications", badge: true },
    { label: t("privacy"), description: t("privacyDesc"), href: "/settings/privacy" },
  ];

  const actionItems: SettingsItem[] = [
    {
      label: t("addPaymentMethods"),
      description: t("addPaymentMethodsDesc"),
      onClick: () => setShowPaymentMethods(true),
    },
    {
      label: t("helpSupport"),
      description: t("helpSupportDesc"),
      href: "/settings/support",
    },
    {
      label: t("signOut"),
      description: t("signOutDesc"),
      onClick: logout,
    },
  ];

  const SettingsItemComponent = ({ item }: { item: SettingsItem }) => {
    const content = (
      <div className="flex items-center gap-4 py-4 bg-white rounded-xl hover:bg-gray-50 transition-colors">
        <div className="p-2 bg-(--color-button-table) rounded-md">
          <BusFront className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-xs text-black">{item.label}</span>
            {item.badge && <span className="w-2 h-2 bg-red-500 rounded-full" />}
          </div>
          {item.description && <p className="text-xs font-normal text-(--color-gray-light)">{item.description}</p>}
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
        className="w-full text-left cursor-pointer"
      >
        {content}
      </button>
    );
  };

  return (
    <>
      <div className="block md:hidden">
        <MobileLayout showFAB={!showPaymentMethods} showBottomNav={!showPaymentMethods}>
          <Header title={t("settings")} showBack />
          <div className="max-w-md mx-auto space-y-6 bg-(--color-yellow-light)">
            <div className=" py-6 px-4 max-sm:rounded-t-2xl sm:rounded-none bg-(--color-white)">
              <div>
                <h2 className="text-base font-medium text-black mb-3">{t("account")}</h2>
                <div className="space-y-2">
                  {accountItems.map((item, index) => (
                    <SettingsItemComponent key={index} item={item} />
                  ))}
                </div>
              </div>
              <div>
                <h2 className="text-base font-medium text-black mb-3">{t("actions")}</h2>
                <div className="space-y-2">
                  {actionItems.map((item, index) => (
                    <SettingsItemComponent key={index} item={item} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </MobileLayout>
      </div>
      <div className="hidden md:block">
        <MobileLayout showFAB={true} showBottomNav={true}>
          <Header title="Settings" />
          <div className="max-w-7xl mx-auto  py-12 grid grid-cols-4 gap-8">
            <aside className="col-span-4 space-y-6">
              <div className="bg-white rounded-xl p-4 shadow">
                <h2 className="text-base font-medium text-black mb-3">Account</h2>
                <div className="space-y-2">
                  {accountItems.map((item, index) => (
                    <div key={index}>
                      {item.href ? (
                        <Link href={item.href} className="block">
                          <div className="flex items-center gap-4 py-2 bg-white rounded-xl hover:bg-gray-50">
                            <div className="p-2 bg-(--color-button-table) rounded-md">
                              <BusFront className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-xs text-black">{item.label}</span>
                                {item.badge && <span className="w-2 h-2 bg-red-500 rounded-full" />}
                              </div>
                              <p className="text-xs font-normal text-(--color-gray-light)">{item.description}</p>
                            </div>
                          </div>
                        </Link>
                      ) : (
                        <button onClick={() => item.onClick && item.onClick()} className="w-full text-left cursor-pointer">
                          <div className="flex items-center gap-4 py-2 bg-white rounded-xl hover:bg-gray-50">
                            <div className="p-2 bg-(--color-button-table) rounded-md">
                              <BusFront className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{item.label}</span>
                                {item.badge && <span className="w-2 h-2 bg-red-500 rounded-full" />}
                              </div>
                              <p className="text-xs font-normal text-(--color-gray-light)">{item.description}</p>
                            </div>
                          </div>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow">
                <h2 className="text-base font-medium text-black mb-3">Actions</h2>
                <div className="space-y-2">
                  {actionItems.map((item, index) => (
                    <div key={index}>
                      {item.href ? (
                        <Link href={item.href} className="block">
                          <div className="flex items-center gap-4 py-2 bg-white rounded-xl hover:bg-gray-50">
                            <div className="p-2 bg-(--color-button-table) rounded-md">
                              <BusFront className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-xs text-black">{item.label}</span>
                                {item.badge && <span className="w-2 h-2 bg-red-500 rounded-full" />}
                              </div>
                              <p className="text-xs font-normal text-(--color-gray-light)">{item.description}</p>
                            </div>
                          </div>
                        </Link>
                      ) : (
                        <button
                          onClick={() => {
                            item.onClick && item.onClick();
                          }}
                          className="w-full text-left cursor-pointer"
                        >
                          <div className="flex items-center gap-4 py-2 bg-white rounded-xl hover:bg-gray-50">
                            <div className="p-2 bg-(--color-button-table) rounded-md">
                              <BusFront className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-xs text-black">{item.label}</span>
                                {item.badge && <span className="w-2 h-2 bg-red-500 rounded-full" />}
                              </div>
                              <p className="text-xs font-normal text-(--color-gray-light)">{item.description}</p>
                            </div>
                          </div>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </MobileLayout>
      </div>

      {/* Modal (mobile bottom-sheet + desktop centered) */}
      <Modal isOpen={showPaymentMethods} onClose={() => setShowPaymentMethods(false)} title="Payment Methods" />
    </>
  );
}
