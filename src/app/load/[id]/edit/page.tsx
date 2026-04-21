"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header, MobileLayout } from "@/components/layout";
import { useLoads } from "@/contexts/LoadContext";
import { PaymentTerms, ShippingType } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { InputWithIcon } from "@/app/add-load/_components/InputWithIcon";
import { SelectWithIcon } from "@/app/add-load/_components/SelectWithIcon";
import { LocationPicker } from "@/app/add-load/_components/LocationPicker";
import { Textarea } from "@/components/ui/textarea";
import { BusFront, Camera, Loader2, User, UserRound, X } from "lucide-react";
import { uploadToCloudinary, validateImageFile } from "@/lib/cloudinary";
import { useTranslations } from "next-intl";
import api from "@/lib/api";

export default function EditLoadPage() {
  const params = useParams();
  const router = useRouter();
  const { getLoadById, refreshLoads } = useLoads();
  const t = useTranslations("addLoad");
  const tHeader = useTranslations("header");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const load = getLoadById(params.id as string);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    pickupLocation: "",
    dropoffLocation: "",
    shippingType: "FTL" as ShippingType,
    loadWeight: "",
    pallets: "",
    clientName: "",
    clientPrice: "",
    assignedDriverId: "",
    driverPrice: "",
    paymentTerms: 45 as PaymentTerms,
    expectedPayoutDate: "",
    loadingDate: "",
    loadingTime: "",
    fuel: "",
    tolls: "",
    otherExpenses: "",
    notes: "",
  });
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Load existing data
  useEffect(() => {
    if (load) {
      setFormData({
        pickupLocation: load.pickupLocation || "",
        dropoffLocation: load.dropoffLocation || "",
        shippingType: load.shippingType || "FTL",
        loadWeight: load.loadWeight?.toString() || "",
        pallets: load.pallets?.toString() || "",
        clientName: load.clientName || "",
        clientPrice: load.clientPrice?.toString() || "",
        assignedDriverId: load.assignedDriver?.id || "",
        driverPrice: load.driverPrice?.toString() || "",
        paymentTerms: load.paymentTerms || 45,
        expectedPayoutDate: load.expectedPayoutDate ? new Date(load.expectedPayoutDate).toISOString().split('T')[0] : "",
        loadingDate: load.loadingDate ? new Date(load.loadingDate).toISOString().split('T')[0] : "",
        loadingTime: load.loadingTime || "",
        fuel: load.fuel?.toString() || "",
        tolls: load.tolls?.toString() || "",
        otherExpenses: load.otherExpenses?.toString() || "",
        notes: load.notes || "",
      });
      setImages(load.initialImages || []);
    }
  }, [load]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError("");

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const validation = validateImageFile(file);
        if (!validation.valid) {
          throw new Error(validation.error);
        }
        return uploadToCloudinary(file);
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setImages((prev) => [...prev, ...uploadedUrls]);
    } catch (err: any) {
      setError(err.message || "Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Fetch drivers
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await api.getDrivers();
        if (response.success && response.drivers) {
          setDrivers(response.drivers);
        }
      } catch (error) {
        console.error("Failed to fetch drivers:", error);
      } finally {
        setIsLoadingDrivers(false);
      }
    };
    fetchDrivers();
  }, []);

  const loadWeightOptions = [
    { value: "100", label: "100 KG" },
    { value: "200", label: "200 KG" },
    { value: "300", label: "300 KG" },
    { value: "500", label: "500 KG" },
    { value: "700", label: "700 KG" },
    { value: "1000", label: "1000 KG" },
  ];

  const shippingTypeOptions = [
    { value: "FTL", label: t("ftl") },
    { value: "LTL", label: t("ltl") },
    { value: "Partial", label: t("partial") },
    { value: "Expedited", label: t("expedited") },
  ];

  const paymentTermsOptions = [
    { value: "30", label: `30 ${t("daysPaymentTerm")}` },
    { value: "45", label: `45 ${t("daysPaymentTerm")}` },
    { value: "60", label: `60 ${t("daysPaymentTerm")}` },
    { value: "90", label: `90 ${t("daysPaymentTerm")}` },
    { value: "120", label: `120 ${t("daysPaymentTerm")}` },
  ];

  const driverOptions = drivers.map((driver) => ({
    value: driver._id,
    label: driver.name,
  }));

  const palletOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => ({
    value: n.toString(),
    label: `${n} ${n > 1 ? t("pallets") : t("pallet")}`,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const updateData: any = {
        pickupLocation: formData.pickupLocation,
        dropoffLocation: formData.dropoffLocation,
        clientName: formData.clientName,
        clientPrice: parseFloat(formData.clientPrice) || 0,
        driverPrice: parseFloat(formData.driverPrice) || 0,
        shippingType: formData.shippingType,
        loadWeight: parseFloat(formData.loadWeight) || 0,
        pallets: parseFloat(formData.pallets) || undefined,
        loadingDate: formData.loadingDate,
        loadingTime: formData.loadingTime,
        paymentTerms: formData.paymentTerms,
        fuel: parseFloat(formData.fuel) || 0,
        tolls: parseFloat(formData.tolls) || 0,
        otherExpenses: parseFloat(formData.otherExpenses) || 0,
        notes: formData.notes,
        initialImages: images,
      };

      const response = await api.updateLoad(params.id as string, updateData);
      
      if (response.success) {
        await refreshLoads();
        router.push(`/load/${params.id}`);
      } else {
        setError(response.message || "Failed to update load");
      }
    } catch (err: any) {
      setError(err.message || "Failed to update load. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!load) {
    return (
      <MobileLayout showFAB={false}>
        <Header title="Edit Load" showBack />
        <div className="px-4 py-8 text-center text-gray-500">Load not found</div>
      </MobileLayout>
    );
  }

  const content = (
    <div className="px-4 xl:px-0 py-8 max-w-7xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-none shadow-none py-0">
          <CardContent className="space-y-4 px-0">
            <div className="lg:col-span-2">
              <LocationPicker
                pickupValue={formData.pickupLocation}
                dropoffValue={formData.dropoffLocation}
                onPickupChange={(value: string) => setFormData({ ...formData, pickupLocation: value })}
                onDropoffChange={(value: string) => setFormData({ ...formData, dropoffLocation: value })}
                t={t}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SelectWithIcon
                icon={BusFront}
                value={formData.shippingType}
                onValueChange={(value) => setFormData({ ...formData, shippingType: value as ShippingType })}
                options={shippingTypeOptions}
              />
              <SelectWithIcon
                icon={BusFront}
                value={formData.loadWeight}
                onValueChange={(value) => setFormData({ ...formData, loadWeight: value })}
                placeholder={t("loadWeight")}
                options={loadWeightOptions}
              />
              <SelectWithIcon
                icon={BusFront}
                value={formData.pallets}
                onValueChange={(value) => setFormData({ ...formData, pallets: value })}
                placeholder={t("pallets")}
                options={palletOptions}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputWithIcon
                icon={User}
                id="clientName"
                type="text"
                placeholder={t("clientName")}
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                required
              />
              <InputWithIcon
                icon={UserRound}
                id="clientPrice"
                type="number"
                placeholder={t("clientPrice")}
                value={formData.clientPrice}
                onChange={(e) => setFormData({ ...formData, clientPrice: e.target.value })}
                required
              />
              <SelectWithIcon
                icon={BusFront}
                value={formData.assignedDriverId}
                onValueChange={(value) => setFormData({ ...formData, assignedDriverId: value })}
                placeholder={isLoadingDrivers ? t("loadingDrivers") || "Loading drivers..." : t("assignDriver")}
                options={driverOptions}
                disabled={isLoadingDrivers}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputWithIcon
                icon={BusFront}
                id="driverPrice"
                type="number"
                placeholder={t("priceToDriver")}
                value={formData.driverPrice}
                onChange={(e) => setFormData({ ...formData, driverPrice: e.target.value })}
              />
              <SelectWithIcon
                icon={BusFront}
                value={formData.paymentTerms.toString()}
                onValueChange={(value) => setFormData({ ...formData, paymentTerms: parseInt(value) as PaymentTerms })}
                options={paymentTermsOptions}
              />
              <InputWithIcon
                icon={BusFront}
                id="expectedPayoutDate"
                type="date"
                placeholder={t("expectedPayoutDate") || "Expected Payout Date"}
                showPlaceholderForDate={true}
                value={formData.expectedPayoutDate}
                onChange={(e) => setFormData({ ...formData, expectedPayoutDate: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputWithIcon
                icon={BusFront}
                id="loadingTime"
                type="time"
                placeholder={t("loadingTime")}
                showPlaceholderForDate={true}
                value={formData.loadingTime}
                onChange={(e) => setFormData({ ...formData, loadingTime: e.target.value })}
                required
              />
              <InputWithIcon
                icon={BusFront}
                id="loadingDate"
                placeholder={t("loadingDate")}
                showPlaceholderForDate={true}
                type="date"
                value={formData.loadingDate}
                onChange={(e) => setFormData({ ...formData, loadingDate: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputWithIcon
                icon={BusFront}
                id="fuel"
                type="number"
                placeholder={t("fuel")}
                value={formData.fuel}
                onChange={(e) => setFormData({ ...formData, fuel: e.target.value })}
              />
              <InputWithIcon
                icon={BusFront}
                id="tolls"
                type="number"
                placeholder={t("tolls")}
                value={formData.tolls}
                onChange={(e) => setFormData({ ...formData, tolls: e.target.value })}
              />
              <InputWithIcon
                icon={BusFront}
                id="otherExpenses"
                type="number"
                placeholder={t("other")}
                value={formData.otherExpenses}
                onChange={(e) => setFormData({ ...formData, otherExpenses: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-12 gap-2 md:gap-4">
              <div className="col-span-8">
                <Textarea
                  id="notes"
                  placeholder={t("notes")}
                  className="rounded-sm! border border-[#CECECE]!"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div className="col-span-4">
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/jpeg,image/jpg,image/png,image/gif,image/webp" multiple className="hidden" />
                <div className="flex items-center gap-4 flex-wrap">
                  {images.map((image, index) => (
                    <div key={index} className="relative w-24 h-24">
                      <img src={image} alt={`Upload ${index + 1}`} className="w-full h-full object-cover rounded-xl" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <div
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    className={`w-full h-20 bg-[#E5E9EE]  border border-[#CECECE]! rounded-sm flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-yellow-400 transition-colors ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {isUploading ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <>
                        <Camera className="h-6 w-6 mb-1 text-[#0095FF]" />
                        <span className="text-xs text-[#0095FF] text-center">{t("uploadPhotos")}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-12"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 h-12 bg-blue-500 hover:bg-blue-600 text-white"
              >
                {isSubmitting ? "Updating..." : "Update Load"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );

  return (
    <>
      <div className="block md:hidden">
        <MobileLayout showFAB={false}>
          <Header title="Edit Load" showBack />
          {content}
        </MobileLayout>
      </div>
      <div className="hidden md:block min-h-screen bg-gray-50">
        <Header title="Edit Load" showBack />
        {content}
      </div>
    </>
  );
}
