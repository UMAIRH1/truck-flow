"use client";

import React, { useState } from "react";
import { Header } from "@/components/layout";
import { MobileLayout } from "@/components/layout";
import { useLoads } from "@/contexts/LoadContext";
import { PaymentTerms, ShippingType } from "@/types";
import { MapPin, Package, User, DollarSign, Calendar, Clock, Fuel, AlertCircle, Camera, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AddLoadPage() {
  const router = useRouter();
  const { addLoad, drivers } = useLoads();

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
  const [error, setError] = useState("");

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
      <Header title="Add Load" showBack />

      <form onSubmit={handleSubmit} className="px-4 py-4 max-w-md mx-auto space-y-4">
        {/* Location Inputs */}
        <div className="space-y-3">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-400 rounded-full" />
            <input
              type="text"
              placeholder="From"
              value={formData.pickupLocation}
              onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
            />
            <div className="absolute left-[18px] top-full h-6 w-0.5 bg-gray-200" />
          </div>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-yellow-400 rounded-full" />
            <input
              type="text"
              placeholder="To"
              value={formData.dropoffLocation}
              onChange={(e) => setFormData({ ...formData, dropoffLocation: e.target.value })}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
            />
          </div>
        </div>

        {/* Shipping Type */}
        <div className="relative">
          <Package className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select
            value={formData.shippingType}
            onChange={(e) => setFormData({ ...formData, shippingType: e.target.value as ShippingType })}
            className="w-full pl-12 pr-10 py-3 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value="FTL">FTL - Full Truck Load</option>
            <option value="LTL">LTL - Less Than Truck Load</option>
            <option value="Partial">Partial Load</option>
            <option value="Expedited">Expedited</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>

        {/* Load Weight */}
        <div className="relative">
          <Package className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select
            value={formData.loadWeight}
            onChange={(e) => setFormData({ ...formData, loadWeight: e.target.value })}
            className="w-full pl-12 pr-10 py-3 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value="">Load Weight</option>
            <option value="100">100 KG</option>
            <option value="200">200 KG</option>
            <option value="300">300 KG</option>
            <option value="500">500 KG</option>
            <option value="700">700 KG</option>
            <option value="1000">1000 KG</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>

        {/* Pallets */}
        <div className="relative">
          <Package className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select
            value={formData.pallets}
            onChange={(e) => setFormData({ ...formData, pallets: e.target.value })}
            className="w-full pl-12 pr-10 py-3 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value="">Pallets</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <option key={n} value={n}>
                {n} Pallet{n > 1 ? "s" : ""}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>

        {/* Client Name */}
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Client's Name"
            value={formData.clientName}
            onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
            required
          />
        </div>

        {/* Client Price */}
        <div className="relative">
          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="number"
            placeholder="Client's Price"
            value={formData.clientPrice}
            onChange={(e) => setFormData({ ...formData, clientPrice: e.target.value })}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
            required
          />
        </div>

        {/* Assign Driver */}
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select
            value={formData.assignedDriverId}
            onChange={(e) => setFormData({ ...formData, assignedDriverId: e.target.value })}
            className="w-full pl-12 pr-10 py-3 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value="">Assign Driver</option>
            {drivers.map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.name} {driver.isAvailable ? "" : "(Unavailable)"}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>

        {/* Driver Price */}
        <div className="relative">
          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="number"
            placeholder="Price to Driver"
            value={formData.driverPrice}
            onChange={(e) => setFormData({ ...formData, driverPrice: e.target.value })}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>

        {/* Payment Terms */}
        <div className="relative">
          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select
            value={formData.paymentTerms}
            onChange={(e) => setFormData({ ...formData, paymentTerms: parseInt(e.target.value) as PaymentTerms })}
            className="w-full pl-12 pr-10 py-3 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value={30}>30 Days Payment Term</option>
            <option value={45}>45 Days Payment Term</option>
            <option value={60}>60 Days Payment Term</option>
            <option value={90}>90 Days Payment Term</option>
            <option value={120}>120 Days Payment Term</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>

        {/* Expected Payout Date */}
        <div className="relative">
          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="date"
            placeholder="Expected Payout Date"
            value={formData.expectedPayoutDate}
            onChange={(e) => setFormData({ ...formData, expectedPayoutDate: e.target.value })}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>

        {/* Loading Date & Time */}
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={formData.loadingDate}
              onChange={(e) => setFormData({ ...formData, loadingDate: e.target.value })}
              className="w-full pl-10 pr-2 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
            />
          </div>
          <div className="relative">
            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="time"
              value={formData.loadingTime}
              onChange={(e) => setFormData({ ...formData, loadingTime: e.target.value })}
              className="w-full pl-10 pr-2 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
            />
          </div>
        </div>

        {/* Expenses */}
        <div className="flex gap-2">
          <div className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl">
            <Fuel className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Fuel</span>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>
          <div className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl">
            <AlertCircle className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Tolls</span>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>
          <div className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl">
            <AlertCircle className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Other</span>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* Notes */}
        <textarea
          placeholder="Notes (Optional)"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 min-h-[80px] resize-none"
        />

        {/* Upload Photos */}
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-yellow-400 transition-colors">
            <Camera className="h-6 w-6 mb-1" />
            <span className="text-xs text-center">
              Upload Photos
              <br />
              (Optional)
            </span>
          </div>
        </div>

        {/* Profit Calculation */}
        <button type="button" className="w-full py-3 bg-yellow-400 rounded-xl font-semibold text-center hover:bg-yellow-500 transition-colors">
          Profit Calculation: ${calculateProfit().toFixed(2)}
        </button>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full py-4 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Creating Load..." : "Submit & Add"}
        </button>
      </form>
    </MobileLayout>
  );
}
