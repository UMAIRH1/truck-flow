"use client";

import React, { useState } from "react";
import { Header, MobileLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export default function PrivacySettingsPage() {
  const [deleting, setDeleting] = useState(false);
  const t = useTranslations("privacy");
  const tHeader = useTranslations("header");

  const handleDeleteAccount = () => {
    setDeleting(true);
    setTimeout(() => {
      setDeleting(false);
      toast.success(t("accountDeleted"));
    }, 1200);
  };

  return (
    <MobileLayout showFAB={true}>
      <Header title={tHeader("privacy")} showBack />
      <div className=" max-w-7xl mx-auto sm:mt-7 max-sm:bg-(--color-yellow-light)">
        <div className="bg-white rounded-t-2xl px-4 py-6 space-y-6">
          <section className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <h3 className="text-lg font-semibold mb-2 text-red-600">{t("deleteAccount")}</h3>
            <p className="text-sm text-(--color-extra-light-gray) mb-4">{t("deleteAccountDesc")}</p>
            <div className="flex items-center justify-end">
              <Button onClick={handleDeleteAccount} className="bg-red-50 rounded-md h-11 text-red-700" disabled={deleting}>
                {deleting ? t("deleting") : t("deleteAccount")}
              </Button>
            </div>
          </section>
          <section className="text-xs text-gray-500">
            <p>
              {t("termsAgreement")}{" "}
              <a href="/terms" className="underline">
                {t("terms")}
              </a>{" "}
              and{" "}
              <a href="/privacy" className="underline">
                {t("privacyPolicy")}
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </MobileLayout>
  );
}
