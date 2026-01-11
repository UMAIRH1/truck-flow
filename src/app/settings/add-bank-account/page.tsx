"use client";

import React, { useState } from "react";
import { Header, MobileLayout } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { toast } from "sonner";
import { ASSETS } from "@/lib/assets";

export default function AddBankAccountPage() {
  const [fullName, setFullName] = useState("");
  const [bank, setBank] = useState("");
  const [account, setAccount] = useState("");
  const [swift, setSwift] = useState("");
  const [errors, setErrors] = useState<{ fullName?: string; bank?: string; account?: string; swift?: string }>({});

  function validate() {
    const newErrors: { fullName?: string; bank?: string; account?: string; swift?: string } = {};
    if (!fullName.trim()) newErrors.fullName = "Full name is required";
    if (!bank.trim()) newErrors.bank = "Bank name is required";
    if (!account.trim()) newErrors.account = "Account number is required";
    if (!swift.trim()) newErrors.swift = "Swift code is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleLinkBank() {
    if (validate()) {
      toast.success("Bank account linked successfully!");
    }
  }

  const Content = () => (
    <div className="space-y-6 md:grid md:grid-cols-2 md:gap-8 md:items-start md:space-y-0 ">
      <div>
        <div className="rounded-xl overflow-hidden shadow-lg">
          <div className="bg-(--color-yellow-light) h-36 md:h-56 flex items-center justify-center md:p-6">
            <OptimizedImage src={ASSETS.images.icons.addCard} alt="bank" className="h-32" />
          </div>
        </div>
      </div>

      <div>
        <div className="space-y-4 md:bg-white md:rounded-xl md:p-6 md:border md:border-gray-100 md:shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="block text-base font-bold text-black mb-1">Full Name</label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" className="w-full px-4 py-6! border border-gray-200! rounded-md!" />
              {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
            </div>

            <div>
              <label className="block text-base font-bold text-black mb-1">Select Your Bank</label>
              <Input value={bank} onChange={(e) => setBank(e.target.value)} placeholder="Bank name" className="w-full px-4 py-6! border border-gray-200! rounded-md!" />
              {errors.bank && <p className="text-red-500 text-sm mt-1">{errors.bank}</p>}
            </div>

            <div>
              <label className="block text-base font-bold text-black mb-1">Account Number</label>
              <Input value={account} onChange={(e) => setAccount(e.target.value)} placeholder="Account number" className="w-full px-4 py-6! border border-gray-200! rounded-md!" />
              {errors.account && <p className="text-red-500 text-sm mt-1">{errors.account}</p>}
            </div>

            <div>
              <label className="block text-base font-bold text-black mb-1">Swift Code</label>
              <Input value={swift} onChange={(e) => setSwift(e.target.value)} placeholder="Swift code" className="w-full px-4 py-6! border border-gray-200! rounded-md!" />
              {errors.swift && <p className="text-red-500 text-sm mt-1">{errors.swift}</p>}
            </div>

            <div className="pt-4">
              <Button onClick={handleLinkBank} className="w-full rounded-md text-base font-medium bg-black h-11 text-white">
                Link Bank Account
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="block md:hidden">
        <MobileLayout  showBottomNav={true} showFAB={true}>
          <Header title="Link Bank Account" showBack />
          <div className=" max-w-md mx-auto  space-y-6 bg-(--color-yellow-light)">
            <div className="bg-white px-4 py-6 rounded-t-2xl">
              <Content />
            </div>
          </div>
        </MobileLayout>
      </div>

      {/* Desktop */}
      <div className="hidden md:block min-h-screen bg-gray-50">
        <Header title="Link Bank Account" showBack />
        <div className="max-w-7xl mx-auto py-12 px-6 ">
          <Content />
        </div>
      </div>
    </>
  );
}
