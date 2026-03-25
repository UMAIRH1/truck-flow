"use client";

import React, { useState, useRef } from "react";
import { Header } from "@/components/layout";
import { MobileLayout } from "@/components/layout";
import { useLoads } from "@/contexts/LoadContext";
import { PaymentTerms, ShippingType } from "@/types";
import { DollarSign, Fuel, AlertCircle, Camera, X, Loader2, Circle, Calendar, Clock, User, Scale, Truck, CreditCard, UserCheck, Package, MapPin, BusFront, UserRound } from "lucide-react";
import { uploadToCloudinary, validateImageFile } from "@/lib/cloudinary";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { InputWithIcon } from "./_components/InputWithIcon";
import { SelectWithIcon } from "./_components/SelectWithIcon";
import { LocationPicker } from "./_components/LocationPicker";

export default function AddLoadPage() {
  const router = useRouter();
  const { addLoad } = useLoads();
  const t = useTranslations("addLoad");
  const tHeader = useTranslations("header");

  const [drivers, setDrivers] = useState<any[]>([]);
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(true);

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
    // Cost model fields
    fuelConsumption: "30",
    fuelPricePerLiter: "",
    driverDailyCost: "",
    truckCostPerKm: "",
  });

  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [distance, setDistance] = useState<number | null>(null);
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);
  const [costBreakdown, setCostBreakdown] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch drivers on mount
  React.useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const api = (await import("@/lib/api")).default;
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

  // Calculate distance when locations change
  React.useEffect(() => {
    const calculateDistance = async () => {
      if (!formData.pickupLocation || !formData.dropoffLocation) {
        setDistance(null);
        return;
      }

      setIsCalculatingDistance(true);
      try {
        const api = (await import("@/lib/api")).default;
        
        const startLoc = pickupCoords ? `${pickupCoords.lat},${pickupCoords.lng}` : formData.pickupLocation;
        const endLoc = dropoffCoords ? `${dropoffCoords.lat},${dropoffCoords.lng}` : formData.dropoffLocation;

        const response = await api.calculateDistance(
          startLoc,
          endLoc
        );
        if (response.success && response.distance) {
          setDistance(response.distance);
        }
      } catch (error: any) {
        console.error("Failed to calculate distance:", error);
        setDistance(null);
        // Don't show error to user - distance calculation is optional
        // Load can still be created without distance
      } finally {
        setIsCalculatingDistance(false);
      }
    };

    const debounceTimer = setTimeout(calculateDistance, 1200); // Increased debounce to 1.2s
    return () => clearTimeout(debounceTimer);
  }, [formData.pickupLocation, formData.dropoffLocation, pickupCoords, dropoffCoords]);

  // Calculate costs when relevant fields change
  React.useEffect(() => {
    const calculateCosts = async () => {
      if (!distance || !formData.clientPrice) {
        setCostBreakdown(null);
        return;
      }

      try {
        const api = (await import("@/lib/api")).default;
        const response = await api.calculateCosts({
          distance,
          clientPrice: parseFloat(formData.clientPrice),
          fuelConsumption: parseFloat(formData.fuelConsumption) || 30,
          fuelPricePerLiter: parseFloat(formData.fuelPricePerLiter) || 0,
          driverDailyCost: parseFloat(formData.driverDailyCost) || 0,
          truckCostPerKm: parseFloat(formData.truckCostPerKm) || 0,
          tolls: parseFloat(formData.tolls) || 0,
          otherExpenses: parseFloat(formData.otherExpenses) || 0,
        });
        if (response.success && response.costs) {
          setCostBreakdown(response.costs);
        }
      } catch (error) {
        console.error("Failed to calculate costs:", error);
        setCostBreakdown(null);
      }
    };

    const debounceTimer = setTimeout(calculateCosts, 500);
    return () => clearTimeout(debounceTimer);
  }, [distance, formData.clientPrice, formData.fuelConsumption, formData.fuelPricePerLiter, 
      formData.driverDailyCost, formData.truckCostPerKm, formData.tolls, formData.otherExpenses]);

  // Load weight options
  const loadWeightOptions = [
    { value: "100", label: "100 KG" },
    { value: "200", label: "200 KG" },
    { value: "300", label: "300 KG" },
    { value: "500", label: "500 KG" },
    { value: "700", label: "700 KG" },
    { value: "1000", label: "1000 KG" },
  ];

  // Shipping type options
  const shippingTypeOptions = [
    { value: "FTL", label: t("ftl") },
    { value: "LTL", label: t("ltl") },
    { value: "Partial", label: t("partial") },
    { value: "Expedited", label: t("expedited") },
  ];

  // Payment terms options
  const paymentTermsOptions = [
    { value: "30", label: `30 ${t("daysPaymentTerm")}` },
    { value: "45", label: `45 ${t("daysPaymentTerm")}` },
    { value: "60", label: `60 ${t("daysPaymentTerm")}` },
    { value: "90", label: `90 ${t("daysPaymentTerm")}` },
    { value: "120", label: `120 ${t("daysPaymentTerm")}` },
  ];

  // Driver options from API
  const driverOptions = drivers.map((driver) => ({
    value: driver._id,
    label: driver.name,
  }));

  // Pallets options
  const palletOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => ({
    value: n.toString(),
    label: `${n} ${n > 1 ? t("pallets") : t("pallet")}`,
  }));

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
      const loadingDate = new Date(formData.loadingDate);
      const expectedPayoutDate = new Date(loadingDate);
      expectedPayoutDate.setDate(expectedPayoutDate.getDate() + formData.paymentTerms);

      await addLoad({
        pickupLocation: formData.pickupLocation,
        dropoffLocation: formData.dropoffLocation,
        pickupCoords: pickupCoords || undefined,
        dropoffCoords: dropoffCoords || undefined,
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
        status: "pending",
        notes: formData.notes,
        fuel: parseFloat(formData.fuel) || 0,
        tolls: parseFloat(formData.tolls) || 0,
        otherExpenses: parseFloat(formData.otherExpenses) || 0,
        podImages: images,
        // Cost model fields
        fuelConsumption: parseFloat(formData.fuelConsumption) || 30,
        fuelPricePerLiter: parseFloat(formData.fuelPricePerLiter) || 0,
        driverDailyCost: parseFloat(formData.driverDailyCost) || 0,
        truckCostPerKm: parseFloat(formData.truckCostPerKm) || 0,
        assignedDriver: formData.assignedDriverId ? {
          id: formData.assignedDriverId,
          name: drivers.find(d => d._id === formData.assignedDriverId)?.name || "",
          phone: "",
          email: "",
          isAvailable: true,
        } : undefined,
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
    
    // Gross Profit = Client Price - Driver Price
    const grossProfit = income - driverCost;
    
    // Net Profit = Gross Profit - All Expenses
    const netProfit = grossProfit - fuel - tolls - other;
    
    return { grossProfit, netProfit };
  };

  return (
    <MobileLayout showFAB={false}>
      <Header title={tHeader("addLoad")} showBack />
      <div className="px-4 xl:px-0 py-8 max-w-7xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border-none shadow-none py-0">
            <CardContent className="space-y-4 px-0 ">
              <div className="lg:col-span-2">
                <LocationPicker
                  pickupValue={formData.pickupLocation}
                  dropoffValue={formData.dropoffLocation}
                  onPickupChange={(value: string) => setFormData({ ...formData, pickupLocation: value })}
                  onDropoffChange={(value: string) => setFormData({ ...formData, dropoffLocation: value })}
                  onPickupCoordinates={(lat, lng) => setPickupCoords({ lat, lng })}
                  onDropoffCoordinates={(lat, lng) => setDropoffCoords({ lat, lng })}
                  pickupCoords={pickupCoords}
                  dropoffCoords={dropoffCoords}
                  t={t}
                />
                {distance !== null && (
                  <div className="mt-2 text-sm text-gray-600 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>Distance: <strong>{distance} km</strong></span>
                  </div>
                )}
                {isCalculatingDistance && (
                  <div className="mt-2 text-sm text-gray-500 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Calculating distance...</span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <SelectWithIcon
                    icon={BusFront}
                    value={formData.shippingType}
                    onValueChange={(value) => setFormData({ ...formData, shippingType: value as ShippingType })}
                    options={shippingTypeOptions}
                  />
                </div>
                <div>
                  <InputWithIcon
                    icon={Scale}
                    id="loadWeight"
                    type="number"
                    placeholder={t("loadWeight")}
                    value={formData.loadWeight}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      if (value <= 24000) {
                        setFormData({ ...formData, loadWeight: e.target.value });
                      }
                    }}
                    min="0"
                    max="24000"
                  />
                </div>
                <div>
                  <InputWithIcon
                    icon={Package}
                    id="pallets"
                    type="number"
                    placeholder={t("pallets")}
                    value={formData.pallets}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      if (value <= 33) {
                        setFormData({ ...formData, pallets: e.target.value });
                      }
                    }}
                    min="0"
                    max="33"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <InputWithIcon
                    icon={User}
                    id="clientName"
                    type="text"
                    placeholder={t("clientName")}
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <InputWithIcon
                    icon={UserRound}
                    id="clientPrice"
                    type="number"
                    placeholder={t("clientPrice")}
                    value={formData.clientPrice}
                    onChange={(e) => setFormData({ ...formData, clientPrice: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <SelectWithIcon
                    icon={BusFront}
                    value={formData.assignedDriverId}
                    onValueChange={(value) => setFormData({ ...formData, assignedDriverId: value })}
                    placeholder={isLoadingDrivers ? t("loadingDrivers") || "Loading drivers..." : t("assignDriver")}
                    options={driverOptions}
                    disabled={isLoadingDrivers}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <InputWithIcon
                    icon={BusFront}
                    id="driverPrice"
                    type="number"
                    placeholder={t("priceToDriver")}
                    value={formData.driverPrice}
                    onChange={(e) => setFormData({ ...formData, driverPrice: e.target.value })}
                  />
                </div>
                <div>
                  <SelectWithIcon
                    icon={BusFront}
                    value={formData.paymentTerms.toString()}
                    onValueChange={(value) => setFormData({ ...formData, paymentTerms: parseInt(value) as PaymentTerms })}
                    options={paymentTermsOptions}
                  />
                </div>
                <div>
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
                <div>
                  <InputWithIcon icon={BusFront} id="fuel" type="number" placeholder={t("fuel")} value={formData.fuel} onChange={(e) => setFormData({ ...formData, fuel: e.target.value })} />
                </div>
                <div>
                  <InputWithIcon icon={BusFront} id="tolls" type="number" placeholder={t("tolls")} value={formData.tolls} onChange={(e) => setFormData({ ...formData, tolls: e.target.value })} />
                </div>
                <div>
                  <InputWithIcon
                    icon={BusFront}
                    id="otherExpenses"
                    type="number"
                    placeholder={t("other")}
                    value={formData.otherExpenses}
                    onChange={(e) => setFormData({ ...formData, otherExpenses: e.target.value })}
                  />
                </div>
              </div>

              {/* Cost Model Fields */}
              <div className="border-t pt-4 mt-2">
                <h3 className="text-sm font-semibold mb-3 text-gray-700">Cost Model (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <InputWithIcon
                      icon={Fuel}
                      id="fuelConsumption"
                      type="number"
                      placeholder="Fuel L/100km"
                      value={formData.fuelConsumption}
                      onChange={(e) => setFormData({ ...formData, fuelConsumption: e.target.value })}
                    />
                  </div>
                  <div>
                    <InputWithIcon
                      icon={DollarSign}
                      id="fuelPricePerLiter"
                      type="number"
                      placeholder="Fuel Price/L"
                      value={formData.fuelPricePerLiter}
                      onChange={(e) => setFormData({ ...formData, fuelPricePerLiter: e.target.value })}
                    />
                  </div>
                  <div>
                    <InputWithIcon
                      icon={User}
                      id="driverDailyCost"
                      type="number"
                      placeholder="Driver Daily Cost"
                      value={formData.driverDailyCost}
                      onChange={(e) => setFormData({ ...formData, driverDailyCost: e.target.value })}
                    />
                  </div>
                  <div>
                    <InputWithIcon
                      icon={Truck}
                      id="truckCostPerKm"
                      type="number"
                      placeholder="Truck Cost/km"
                      value={formData.truckCostPerKm}
                      onChange={(e) => setFormData({ ...formData, truckCostPerKm: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-2 md:gap-4">
                <div className="col-span-8">
                  <Textarea
                    id="notes"
                    placeholder={t("notes")}
                    className="rounded-sm! border border-[#CECECE]! "
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
                          <span className="text-xs text-[#0095FF] text-center">Upload Photos (Optional)</span>
                        </>
                      )}
                    </div>
                  </div>
                  {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </div>
              </div>

              <div className="flex md:flex-row flex-col gap-4">
                {costBreakdown && (
                  <div className="flex-1 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold mb-2 text-blue-900">Cost Breakdown</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>Fuel Cost:</div><div className="font-semibold">€{costBreakdown.fuelCost.toFixed(2)}</div>
                      <div>Driver Cost:</div><div className="font-semibold">€{costBreakdown.driverCost.toFixed(2)}</div>
                      <div>Truck Cost:</div><div className="font-semibold">€{costBreakdown.truckCost.toFixed(2)}</div>
                      <div className="border-t pt-1">Total Cost:</div><div className="border-t pt-1 font-bold">€{costBreakdown.totalCost.toFixed(2)}</div>
                      <div className="text-green-700">Profit:</div><div className="font-bold text-green-700">€{costBreakdown.profit.toFixed(2)}</div>
                      <div className="text-gray-600">Profit/km:</div><div className="font-semibold text-gray-600">€{costBreakdown.profitPerKm.toFixed(2)}</div>
                    </div>
                  </div>
                )}
                <Button 
                  type="button" 
                  variant="outline" 
                  className="bg-blue-500 text-white h-12 flex flex-col items-center justify-center py-1" 
                  size="lg"
                >
                  <span className="text-xs">Gross Profit: €{calculateProfit().grossProfit.toFixed(2)}</span>
                  <span className="text-xs font-bold">Net Profit: €{calculateProfit().netProfit.toFixed(2)}</span>
                </Button>
                <Button type="submit" size="lg" disabled={isSubmitting} className="bg-black h-12 hover:bg-blue-600 text-white ">
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
