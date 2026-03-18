"use client";

import React, { useState, useEffect } from "react";
import { Header, MobileLayout } from "@/components/layout";
import { useRoutes } from "@/contexts/RouteContext";
import { useLoads } from "@/contexts/LoadContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Truck, User, Calendar, DollarSign, Fuel } from "lucide-react";
import { GooglePlacesInput } from "@/components/shared";
import api from "@/lib/api";

export default function CreateRoutePage() {
  const router = useRouter();
  const { createRoute } = useRoutes();
  const { loads } = useLoads();
  
  const [drivers, setDrivers] = useState<any[]>([]);
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [distance, setDistance] = useState<number | null>(null);
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);

  const [formData, setFormData] = useState({
    routeName: "",
    origin: "",
    destination: "",
    assignedDriverId: "",
    truckNumber: "",
    truckType: "",
    truckCapacity: "",
    startDate: "",
    endDate: "",
    fuelConsumption: "30",
    fuelPricePerLiter: "",
    driverDailyCost: "",
    truckCostPerKm: "",
    tolls: "",
    otherExpenses: "",
    notes: "",
    selectedLoadIds: [] as string[],
  });

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

  // Calculate distance when origin and destination change
  useEffect(() => {
    const calculateDistance = async () => {
      if (!formData.origin || !formData.destination) {
        setDistance(null);
        return;
      }

      setIsCalculatingDistance(true);
      try {
        const response = await api.calculateDistance(
          formData.origin,
          formData.destination
        );
        if (response.success && response.distance) {
          setDistance(response.distance);
        }
      } catch (error: any) {
        console.error("Failed to calculate distance:", error);
        setDistance(null);
      } finally {
        setIsCalculatingDistance(false);
      }
    };

    const debounceTimer = setTimeout(calculateDistance, 1000);
    return () => clearTimeout(debounceTimer);
  }, [formData.origin, formData.destination]);

  const availableLoads = loads.filter(load => !load.routeId && load.status === 'pending');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await createRoute({
        routeName: formData.routeName,
        origin: formData.origin,
        destination: formData.destination,
        totalDistance: distance || 0,
        assignedDriverId: formData.assignedDriverId,
        assignedTruck: {
          truckNumber: formData.truckNumber,
          truckType: formData.truckType,
          capacity: parseFloat(formData.truckCapacity) || undefined,
        },
        startDate: new Date(formData.startDate),
        endDate: formData.endDate ? new Date(formData.endDate) : undefined,
        fuelConsumption: parseFloat(formData.fuelConsumption) || 30,
        fuelPricePerLiter: parseFloat(formData.fuelPricePerLiter) || 0,
        driverDailyCost: parseFloat(formData.driverDailyCost) || 0,
        truckCostPerKm: parseFloat(formData.truckCostPerKm) || 0,
        tolls: parseFloat(formData.tolls) || 0,
        otherExpenses: parseFloat(formData.otherExpenses) || 0,
        notes: formData.notes,
        loadIds: formData.selectedLoadIds,
      });

      router.push("/routes");
    } catch (err: any) {
      setError(err.message || "Failed to create route");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleLoadSelection = (loadId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedLoadIds: prev.selectedLoadIds.includes(loadId)
        ? prev.selectedLoadIds.filter(id => id !== loadId)
        : [...prev.selectedLoadIds, loadId]
    }));
  };

  return (
    <MobileLayout showFAB={false}>
      <Header title="Create Route" showBack />
      <div className="px-4 py-6 max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Route Name *</label>
                <Input
                  value={formData.routeName}
                  onChange={(e) => setFormData({ ...formData, routeName: e.target.value })}
                  placeholder="e.g., Athens to Thessaloniki Route"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Origin *</label>
                  <GooglePlacesInput
                    value={formData.origin}
                    onChange={(value) => setFormData({ ...formData, origin: value })}
                    placeholder="e.g., Athens"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Destination *</label>
                  <GooglePlacesInput
                    value={formData.destination}
                    onChange={(value) => setFormData({ ...formData, destination: value })}
                    placeholder="e.g., Thessaloniki"
                    required
                  />
                </div>
              </div>

              {distance !== null && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="text-sm text-blue-800 flex items-center gap-2">
                    <span className="font-medium">Calculated Distance:</span>
                    <span className="font-bold">{distance} km</span>
                  </div>
                </div>
              )}

              {isCalculatingDistance && (
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
                  <span>Calculating distance...</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Tolls (€)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.tolls}
                  onChange={(e) => setFormData({ ...formData, tolls: e.target.value })}
                  placeholder="e.g., 50"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Assign Driver *</label>
                  <select
                    value={formData.assignedDriverId}
                    onChange={(e) => setFormData({ ...formData, assignedDriverId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                    disabled={isLoadingDrivers}
                  >
                    <option value="">Select Driver</option>
                    {drivers.map((driver) => (
                      <option key={driver._id} value={driver._id}>
                        {driver.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Truck Number</label>
                  <Input
                    value={formData.truckNumber}
                    onChange={(e) => setFormData({ ...formData, truckNumber: e.target.value })}
                    placeholder="e.g., TRK-001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Start Date *</label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">End Date</label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold mb-3">Cost Model</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2">Fuel Consumption (L/100km)</label>
                    <Input
                      type="number"
                      value={formData.fuelConsumption}
                      onChange={(e) => setFormData({ ...formData, fuelConsumption: e.target.value })}
                      placeholder="30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2">Fuel Price (€/L)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.fuelPricePerLiter}
                      onChange={(e) => setFormData({ ...formData, fuelPricePerLiter: e.target.value })}
                      placeholder="1.50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2">Driver Daily Cost (€)</label>
                    <Input
                      type="number"
                      value={formData.driverDailyCost}
                      onChange={(e) => setFormData({ ...formData, driverDailyCost: e.target.value })}
                      placeholder="100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2">Truck Cost (€/km)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.truckCostPerKm}
                      onChange={(e) => setFormData({ ...formData, truckCostPerKm: e.target.value })}
                      placeholder="0.50"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notes</label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {availableLoads.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-sm font-semibold mb-3">Attach Loads (Optional)</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availableLoads.map((load) => (
                    <label
                      key={load.id}
                      className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={formData.selectedLoadIds.includes(load.id)}
                        onChange={() => toggleLoadSelection(load.id)}
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{load.loadNumber}</div>
                        <div className="text-sm text-gray-600">
                          {load.pickupLocation} → {load.dropoffLocation}
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-green-600">
                        €{load.clientPrice}
                      </div>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-black hover:bg-gray-800"
            >
              {isSubmitting ? "Creating..." : "Create Route"}
            </Button>
          </div>
        </form>
      </div>
    </MobileLayout>
  );
}
