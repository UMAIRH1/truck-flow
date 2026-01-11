"use client";

import React, { useState, useRef, useEffect } from "react";
import { Header, MobileLayout } from "@/components/layout";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import CountrySelector from "./_components/countrySelector";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { ASSETS } from "@/lib/assets";
import { Button } from "@/components/ui/button";

export default function EditProfilePage() {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    password: "••••••••••••",
    phone: user?.phone || "",
    country: user?.country || "Greece",
    avatar: user?.avatar || "",
  });

  const handleSave = () => {
    console.log("Saving profile:", formData);
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const createdUrlRef = useRef<string | null>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e?.target?.files?.[0];
    if (!file) return;
    if (createdUrlRef.current) {
      try {
        URL.revokeObjectURL(createdUrlRef.current);
      } catch (err) {}
    }

    const url = URL.createObjectURL(file);
    createdUrlRef.current = url;
    setFormData((prev) => ({ ...prev, avatar: url }));
  };

  useEffect(() => {
    return () => {
      if (createdUrlRef.current) {
        try {
          URL.revokeObjectURL(createdUrlRef.current);
        } catch (err) {
          /* ignore */
        }
      }
    };
  }, []);

  return (
    <MobileLayout showFAB={true} showBottomNav={true}>
      <Header title="Edit Profile" showBack />
      <div className=" max-w-7xl mx-auto bg-(--color-yellow-light)">
        <div className="py-6 px-4 lg:px-0 max-sm:rounded-t-2xl sm:rounded-none bg-(--color-white)">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start border border-gray-200 p-4 shadow-md rounded-xl ">
            <div className="flex justify-center lg:me-28 md:justify-end ">
              <div className="relative">
                <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-gray-200 overflow-hidden border-4 border-white shadow-lg">
                  {formData.avatar ? (
                    <OptimizedImage src={formData.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl md:text-3xl font-bold">
                      {formData.name?.charAt(0) || "U"}
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 -right-2 -translate-y-1/3 p-2 cursor-pointer transition-colors">
                  <OptimizedImage src={ASSETS.images.icons.camera} alt="Change Avatar" width={30} height={30} />
                </button>
              </div>
            </div>
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="block text-base font-bold text-black mb-1">Name</label>
                <Input
                  type="text"
                  value={formData.name}
                  placeholder="Enter your name"
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 !py-6 border !border-gray-200 !rounded-md"
                />
              </div>

              <div>
                <label className="block text-base font-bold text-black mb-1">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  placeholder="Enter your email"
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 !py-6 border !border-gray-200 !rounded-md"
                />
              </div>

              <div>
                <label className="block text-base font-bold text-black mb-1">Password</label>
                <Input
                  type="password"
                  value={formData.password}
                  placeholder="Enter your password"
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 !py-6 border !border-gray-200 !rounded-md"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-base font-bold text-black mb-1">Phone Number</label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    placeholder="Enter your phone number"
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 !py-6 border !border-gray-200 !rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-base font-bold text-black mb-1">Country/Region</label>
                  <div>
                    <CountrySelector value={formData.country} onChange={(val) => setFormData({ ...formData, country: val })} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-center md:justify-end">
            <Button onClick={handleSave} className="w-full md:w-44 py-3 h-11 bg-black text-white text-base rounded-lg font-medium hover:bg-gray-800 transition-colors">
              Save
            </Button>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
