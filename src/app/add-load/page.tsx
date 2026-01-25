"use client";

import React, { useState, useRef } from "react";
import { Header } from "@/components/layout";
import { MobileLayout } from "@/components/layout";
import { useLoads } from "@/contexts/LoadContext";
import { PaymentTerms, ShippingType } from "@/types";
import { DollarSign, Fuel, AlertCircle, Camera, X, Loader2 } from "lucide-react";
import { uploadToCloudinary, validateImageFile } from "@/lib/cloudinary";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AddLoadPage() {
  const router = useRouter();
  const { addLoad, drivers } = useLoads();
  const t = useTranslations("addLoad");
  const tHeader = useTranslations("header");

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const selectedDriver = drivers.find((d) => d.id === formData.assignedDriverId);
      const loadingDate = new Date(formData.loadingDate);
      const expectedPayoutDate = new Date(loadingDate);
      expectedPayoutDate.setDate(expectedPayoutDate.getDate() + formData.paymentTerms);

      await addLoad({
        pickupLocation: formData.pickupLocation,
        dropoffLocation: formData.dropoffLocation,
        clientName: formData.clientName,
        clientPrice: parseFloat(formData.clientPrice) || 0,
        driverPrice: parseFloat(formData.driverPrice) || 0,
        paymentTerms: formData.paymentTerms,
        expectedPayoutDate,
        loadingDate,
        loadingTime: formData.loadingTime,
        shippingType: formData.shippingType,
        loadWeight: parseFloat(formData.loadWeight) || 0,
        pallets: parseFloat(formData.pallets) || undefined,
        assignedDriver: selectedDriver,
        status: "pending",
        notes: formData.notes,
        fuel: parseFloat(formData.fuel) || 0,
        tolls: parseFloat(formData.tolls) || 0,
        otherExpenses: parseFloat(formData.otherExpenses) || 0,
        podImages: images,
      });

      router.push("/");
    } catch (err: any) {
      setError(err.message || "Failed to create load. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateProfit = () => {
    const income = parseFloat(formData.clientPrice) || 0;
    const driverCost = parseFloat(formData.driverPrice) || 0;
    const fuel = parseFloat(formData.fuel) || 0;
    const tolls = parseFloat(formData.tolls) || 0;
    const other = parseFloat(formData.otherExpenses) || 0;
    return income - driverCost - fuel - tolls - other;
  };

  return (
    <MobileLayout showFAB={false}>
      <Header title={tHeader("addLoad")} showBack />
      <div className="px-4 xl:px-0 py-8 max-w-7xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border-none shadow-none py-0">
            <CardContent className="space-y-4 px-0 ">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-400 rounded-full" />
                    <Input
                      id="pickup"
                      type="text"
                      placeholder={t("from")}
                      value={formData.pickupLocation}
                      onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                      className="pl-8"
                      required
                    />
                  </div>
                </div>
                <div>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-yellow-400 rounded-full" />
                    <Input
                      id="dropoff"
                      type="text"
                      placeholder={t("to")}
                      value={formData.dropoffLocation}
                      onChange={(e) => setFormData({ ...formData, dropoffLocation: e.target.value })}
                      className="pl-8"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Select value={formData.shippingType} onValueChange={(value) => setFormData({ ...formData, shippingType: value as ShippingType })}>
                    <SelectTrigger id="shippingType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FTL">{t("ftl")}</SelectItem>
                      <SelectItem value="LTL">{t("ltl")}</SelectItem>
                      <SelectItem value="Partial">{t("partial")}</SelectItem>
                      <SelectItem value="Expedited">{t("expedited")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Select value={formData.loadWeight} onValueChange={(value) => setFormData({ ...formData, loadWeight: value })}>
                    <SelectTrigger id="loadWeight">
                      <SelectValue placeholder={t("loadWeight")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100">100 KG</SelectItem>
                      <SelectItem value="200">200 KG</SelectItem>
                      <SelectItem value="300">300 KG</SelectItem>
                      <SelectItem value="500">500 KG</SelectItem>
                      <SelectItem value="700">700 KG</SelectItem>
                      <SelectItem value="1000">1000 KG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Select value={formData.pallets} onValueChange={(value) => setFormData({ ...formData, pallets: value })}>
                    <SelectTrigger id="pallets">
                      <SelectValue placeholder={t("pallets")} />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                        <SelectItem key={n} value={n.toString()}>
                          {n} {n > 1 ? t("pallets") : t("pallet")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Input id="loadingDate" type="date" value={formData.loadingDate} onChange={(e) => setFormData({ ...formData, loadingDate: e.target.value })} required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Input id="loadingTime" type="time" value={formData.loadingTime} onChange={(e) => setFormData({ ...formData, loadingTime: e.target.value })} required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input id="clientName" type="text" placeholder={t("clientName")} value={formData.clientName} onChange={(e) => setFormData({ ...formData, clientName: e.target.value })} required />
                </div>
                <div>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="clientPrice"
                      type="number"
                      placeholder={t("clientPrice")}
                      value={formData.clientPrice}
                      onChange={(e) => setFormData({ ...formData, clientPrice: e.target.value })}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Select value={formData.paymentTerms.toString()} onValueChange={(value) => setFormData({ ...formData, paymentTerms: parseInt(value) as PaymentTerms })}>
                    <SelectTrigger id="paymentTerms">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 {t("daysPaymentTerm")}</SelectItem>
                      <SelectItem value="45">45 {t("daysPaymentTerm")}</SelectItem>
                      <SelectItem value="60">60 {t("daysPaymentTerm")}</SelectItem>
                      <SelectItem value="90">90 {t("daysPaymentTerm")}</SelectItem>
                      <SelectItem value="120">120 {t("daysPaymentTerm")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Input id="expectedPayoutDate" type="date" value={formData.expectedPayoutDate} onChange={(e) => setFormData({ ...formData, expectedPayoutDate: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Select value={formData.assignedDriverId} onValueChange={(value) => setFormData({ ...formData, assignedDriverId: value })}>
                    <SelectTrigger id="assignDriver">
                      <SelectValue placeholder={t("assignDriver")} />
                    </SelectTrigger>
                    <SelectContent>
                      {drivers.map((driver) => (
                        <SelectItem key={driver.id} value={driver.id}>
                          {driver.name} {driver.isAvailable ? "" : `(${t("unavailable")})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="driverPrice"
                      type="number"
                      placeholder={t("priceToDriver")}
                      value={formData.driverPrice}
                      onChange={(e) => setFormData({ ...formData, driverPrice: e.target.value })}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="relative">
                    <Fuel className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input id="fuel" type="number" placeholder={t("fuel")} value={formData.fuel} onChange={(e) => setFormData({ ...formData, fuel: e.target.value })} className="pl-9" />
                  </div>
                </div>
                <div>
                  <div className="relative">
                    <AlertCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input id="tolls" type="number" placeholder={t("tolls")} value={formData.tolls} onChange={(e) => setFormData({ ...formData, tolls: e.target.value })} className="pl-9" />
                  </div>
                </div>
                <div>
                  <div className="relative">
                    <AlertCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="otherExpenses"
                      type="number"
                      placeholder={t("other")}
                      value={formData.otherExpenses}
                      onChange={(e) => setFormData({ ...formData, otherExpenses: e.target.value })}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>
              <div>
                <Textarea id="notes" placeholder={t("notes")} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
              </div>
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  multiple
                  className="hidden"
                />
                <div className="flex items-center gap-4 flex-wrap">
                  {images.map((image, index) => (
                    <div key={index} className="relative w-24 h-24">
                      <img
                        src={image}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-full object-cover rounded-xl"
                      />
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
                    className={`w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-yellow-400 transition-colors ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {isUploading ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <>
                        <Camera className="h-6 w-6 mb-1" />
                        <span className="text-xs text-center">Upload</span>
                      </>
                    )}
                  </div>
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </div>
              <div className="flex md:flex-row flex-col gap-4">
                <Button type="button" variant="outline" size="lg" onClick={() => router.push("/")}>
                  Profit Calculation: ${calculateProfit().toFixed(2)}
                </Button>
                <Button type="submit" size="lg" disabled={isSubmitting} className="bg-blue-500 hover:bg-blue-600 text-white ">
                  {isSubmitting ? t("creatingLoad") : t("submitAndAdd")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </MobileLayout>
  );
}
