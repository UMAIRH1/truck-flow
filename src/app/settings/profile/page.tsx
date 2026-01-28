"use client";

import React, { useState, useRef, useEffect } from "react";
import { Header, MobileLayout } from "@/components/layout";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import CountrySelector from "./_components/countrySelector";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { ASSETS } from "@/lib/assets";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import api from "@/lib/api";

export default function EditProfilePage() {
  const { user } = useAuth();
  const t = useTranslations("profile");

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    password: "••••••••••••",
    phone: user?.phone || "",
    country: user?.country || "Greece",
    avatar: user?.avatar || "",
  });

  const handleSave = async () => {
    try {
      const response = await api.updateProfile(formData);
      if (response.success) {
        console.log('Profile updated successfully:', response.user);
        // Optionally update the auth context with new user data
        // You could add a method to AuthContext to update user data
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e?.target?.files?.[0];
    if (!file) return;

    try {
      // Import Cloudinary utilities
      const { uploadToCloudinary, validateImageFile } = await import('@/lib/cloudinary');
      
      // Validate file
      const validation = validateImageFile(file);
      if (!validation.valid) {
        alert(validation.error);
        return;
      }

      // Show loading state
      setFormData((prev) => ({ ...prev, avatar: 'uploading...' }));

      // Upload to Cloudinary
      const cloudinaryUrl = await uploadToCloudinary(file);
      
      // Update avatar with Cloudinary URL
      setFormData((prev) => ({ ...prev, avatar: cloudinaryUrl }));
      
      console.log('Avatar uploaded to Cloudinary:', cloudinaryUrl);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Failed to upload image. Please try again.');
      // Restore previous avatar on error
      setFormData((prev) => ({ ...prev, avatar: user?.avatar || '' }));
    }
  };

  return (
    <MobileLayout showFAB={true} showBottomNav={true}>
      <Header title={t("name")} showBack />
      <div className=" max-w-7xl mx-auto bg-(--color-yellow-light)">
        <div className="py-6 px-4 lg:px-0 max-sm:rounded-t-2xl sm:rounded-none bg-(--color-white)">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start border border-gray-200 p-4 shadow-md rounded-xl ">
            <div className="flex justify-center lg:me-28 md:justify-end ">
              <div className="relative">
                <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-gray-200 overflow-hidden border-4 border-white shadow-lg">
                  {formData.avatar === 'uploading...' ? (
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : formData.avatar ? (
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
                <label className="block text-base font-bold text-black mb-1">{t("name")}</label>
                <Input
                  type="text"
                  value={formData.name}
                  placeholder={t("enterYourName")}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 !py-6 border !border-gray-200 !rounded-md"
                />
              </div>

              <div>
                <label className="block text-base font-bold text-black mb-1">{t("email")}</label>
                <Input
                  type="email"
                  value={formData.email}
                  placeholder={t("enterYourEmail")}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 !py-6 border !border-gray-200 !rounded-md"
                />
              </div>

              <div>
                <label className="block text-base font-bold text-black mb-1">{t("password")}</label>
                <Input
                  type="password"
                  value={formData.password}
                  placeholder={t("password")}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 !py-6 border !border-gray-200 !rounded-md"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-base font-bold text-black mb-1">{t("phone")}</label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    placeholder={t("enterYourPhone")}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 !py-6 border !border-gray-200 !rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-base font-bold text-black mb-1">{t("country")}</label>
                  <div>
                    <CountrySelector value={formData.country} onChange={(val) => setFormData({ ...formData, country: val })} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-center md:justify-end">
            <Button onClick={handleSave} className="w-full md:w-44 py-3 h-11 bg-black text-white text-base rounded-lg font-medium hover:bg-gray-800 transition-colors">
              {t("saveChanges")}
            </Button>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
