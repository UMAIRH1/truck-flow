"use client";

import React, { useState } from "react";
import { Header, MobileLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";

export default function PrivacySettingsPage() {
  const [profileVisible, setProfileVisible] = useState(true);
  const [adPersonalization, setAdPersonalization] = useState(true);
  const [downloadRequested, setDownloadRequested] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const requestDownload = () => {
    // demo: simulate request
    setDownloadRequested(true);
    setTimeout(() => alert("Data export request received (demo). You will be notified when ready."), 100);
  };

  const handleDeleteAccount = () => {
    const ok = confirm("Are you sure you want to delete your account? This action is irreversible.");
    if (!ok) return;
    setDeleting(true);

    // demo: simulate server call
    setTimeout(() => {
      setDeleting(false);
      alert("Account deleted (demo). Redirecting...");
      // In a real app: call sign out / redirect
    }, 1200);
  };

  return (
    <MobileLayout showFAB={false}>
      <Header title="Privacy" showBack />
      <div className="px-4 py-6 max-w-7xl mx-auto space-y-6">
        <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-2 text-red-600">Delete account</h3>
          <p className="text-sm text-(--color-extra-light-gray) mb-4">Permanently delete your account and all associated data. This action cannot be undone.</p>
          <div className="flex items-center justify-end">
            <Button onClick={handleDeleteAccount} className="bg-red-50 rounded-md h-11 text-red-700" disabled={deleting}>
              {deleting ? "Deleting..." : "Delete account"}
            </Button>
          </div>
        </section>
        <section className="text-xs text-gray-500">
          <p>
            By using this app you agree to our{" "}
            <a href="/terms" className="underline">
              Terms
            </a>{" "}
            and{" "}
            <a href="/privacy" className="underline">
              Privacy Policy
            </a>
            .
          </p>
        </section>
      </div>
    </MobileLayout>
  );
}
