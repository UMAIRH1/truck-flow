"use client";

import React, { useState } from "react";
import { Header, MobileLayout } from "@/components/layout";
import { useLoads } from "@/contexts/LoadContext";
import { User, Plus, Mail, Phone, CheckCircle, XCircle } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

export default function DriversPage() {
  const { drivers, refreshDrivers } = useLoads();
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    preferredLanguage: "en",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await api.createDriver(formData);
      
      if (response.success) {
        toast.success("Driver created successfully!");
        setFormData({
          name: "",
          email: "",
          password: "",
          phone: "",
          preferredLanguage: "en",
        });
        setShowAddForm(false);
        refreshDrivers();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create driver");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (driverId: string) => {
    try {
      const response = await api.toggleDriverStatus(driverId);
      
      if (response.success) {
        toast.success(response.message);
        refreshDrivers();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update driver status");
    }
  };

  return (
    <MobileLayout showFAB={false} showBottomNav={true}>
      <Header title="Drivers" showBack />

      <div className="px-4 py-4 max-w-md mx-auto space-y-4 md:max-w-7xl md:px-8">
        {/* Add Driver Button */}
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full py-3 bg-blue-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors"
        >
          <Plus className="h-5 w-5" />
          {showAddForm ? "Cancel" : "Add New Driver"}
        </button>

        {/* Add Driver Form */}
        {showAddForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl p-4 shadow-sm space-y-3 border border-gray-200">
            <h3 className="font-semibold text-lg mb-3">Create New Driver</h3>
            
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Driver Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="tel"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            <div className="relative">
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
                minLength={6}
              />
            </div>

            <div className="relative">
              <select
                value={formData.preferredLanguage}
                onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="en">English</option>
                <option value="el">Greek</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating..." : "Create Driver"}
            </button>
          </form>
        )}

        {/* Drivers List */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">All Drivers ({drivers.length})</h3>
          
          {drivers.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center text-gray-500">
              <User className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No drivers yet. Add your first driver above.</p>
            </div>
          ) : (
            drivers.map((driver) => (
              <div
                key={driver.id}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-base">{driver.name}</h4>
                        {driver.isAvailable ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <Mail className="h-4 w-4" />
                        <span>{driver.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <Phone className="h-4 w-4" />
                        <span>{driver.phone}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleToggleStatus(driver.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      driver.isAvailable
                        ? "bg-red-50 text-red-600 hover:bg-red-100"
                        : "bg-green-50 text-green-600 hover:bg-green-100"
                    }`}
                  >
                    {driver.isAvailable ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
