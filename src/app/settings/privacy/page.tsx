"use client";

import React, { useState } from "react";
import { Header, MobileLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function PrivacySettingsPage() {
  const [deleting, setDeleting] = useState(false);
  const handleDeleteAccount = () => {
    setDeleting(true);
    setTimeout(() => {
      setDeleting(false);
      toast.success("Account deleted successfully!");
    }, 1200);
  };

  return (
    <MobileLayout showFAB={true}>
      <Header title="Privacy" showBack />
      <div className=" max-w-7xl mx-auto sm:mt-7 max-sm:bg-(--color-yellow-light)">
        <div className="bg-white rounded-t-2xl px-4 py-6 space-y-6">
          <section className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
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
      </div>
    </MobileLayout>
  );
}
