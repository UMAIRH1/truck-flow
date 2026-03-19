"use client";

import React, { useState, useEffect } from "react";
import { Header, MobileLayout } from "@/components/layout";
import { useRoutes } from "@/contexts/RouteContext";
import { useLoads } from "@/contexts/LoadContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";

export default function EditRoutePage() {
  const router = useRouter();
  const params = useParams();
  const { routes, updateRoute, addLoadsToRoute, removeLoadFromRoute } = useRoutes();
  const { loads } = useLoads();
  
  const [route, setRoute] = useState<any>(null);
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
    const foundRoute = routes.find(r => r.id === params.id);
    if (foundRoute) {
      setRoute(foundRoute);
      setDistance(foundRoute.totalDistance || null);
      setFormData({
        routeName: foundRoute.routeName || "",
        origin: foundRoute.origin || "",
        destination: foundRoute.destination || "",
        truckNumber: foundRoute.assignedTruck?.truckNumber || "",
        truckType: foundRoute.assignedTruck?.truckType || "",
        truckCapacity: foundRoute.assignedTruck?.capacity?.toString() || "",
        startDate: foundRoute.startDate ? new Date(foundRoute.startDate).toISOString().split('T')[0] : "",
        endDate: foundRoute.endDate ? new Date(foundRoute.endDate).toISOString().split('T')[0] : "",
        fuelConsumption: foundRoute.fuelConsumption?.toString() || "30",
        fuelPricePerLiter: foundRoute.fuelPricePerLiter?.toString() || "",
        driverDailyCost: foundRoute.driverDailyCost?.toString() || "",
        truckCostPerKm: foundRoute.truckCostPerKm?.toString() || "",
        tolls: foundRoute.tolls?.toString() || "",
        otherExpenses: foundRoute.otherExpenses?.toString() || "",
        notes: foundRoute.notes || "",
        selectedLoadIds: foundRoute.loads?.map((l: any) => {
          // Handle both populated loads (objects) and unpopulated (just IDs)
          if (typeof l === 'string') return l;
          return l.id || l._id || l;
        }) || [],
      });
    }
  }, [routes, params.id]);

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

  // Available loads: not attached to any route OR attached to this route
  const availableLoads = loads.filter(load => 
    !load.routeId || load.routeId === params.id
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // Update route details
      await updateRoute(params.id as string, {
        routeName: formData.routeName,
        origin: formData.origin,
        destination: formData.destination,
        totalDistance: distance || route.totalDistance || 0,
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
      });

      // Handle load changes
      const currentLoadIds = route?.loads?.map((l: any) => {
        if (typeof l === 'string') return l;
        return l.id || l._id || l;
      }) || [];
      const newLoadIds = formData.selectedLoadIds;

      // Loads to add
      const loadsToAdd = newLoadIds.filter(id => !currentLoadIds.includes(id));
      if (loadsToAdd.length > 0) {
        await addLoadsToRoute(params.id as string, loadsToAdd);
      }

      // Loads to remove
      const loadsToRemove = currentLoadIds.filter((id: string) => !newLoadIds.includes(id));
      for (const loadId of loadsToRemove) {
        await removeLoadFromRoute(params.id as string, loadId);
      }

      router.push(`/routes/${params.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to update route");
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

  if (!route) {
    return (
      <MobileLayout showFAB={false}>
        <Header title="Edit Route" showBack />
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading route...</div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout showFAB={false}>
      <Header title="Edit Route" showBack />
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
                  <Input
                    value={formData.origin}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                    placeholder="e.g., Athens"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Destination *</label>
                  <Input
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    placeholder="e.g., Thessaloniki"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Distance (km)</label>
                  <Input
                    type="number"
                    value={distance || ""}
                    onChange={(e) => setDistance(parseFloat(e.target.value) || null)}
                    placeholder="Auto-calculated or enter manually"
                  />
                  <p className="text-xs text-gray-500 mt-1">Distance is auto-calculated from origin/destination</p>
                </div>
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Truck Number</label>
                  <Input
                    value={formData.truckNumber}
                    onChange={(e) => setFormData({ ...formData, truckNumber: e.target.value })}
                    placeholder="e.g., TRK-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Truck Type</label>
                  <Input
                    value={formData.truckType}
                    onChange={(e) => setFormData({ ...formData, truckType: e.target.value })}
                    placeholder="e.g., Semi-Trailer"
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

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-sm font-semibold mb-3">Attach/Detach Loads</h3>
              {availableLoads.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No available loads to attach</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availableLoads.map((load) => (
                    <label
                      key={load.id}
                      className="flex items-start gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={formData.selectedLoadIds.includes(load.id)}
                        onChange={() => toggleLoadSelection(load.id)}
                        className="w-4 h-4 mt-0.5 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="font-medium text-sm break-words">{load.loadNumber}</div>
                        <div className="text-xs text-gray-600 break-words">
                          {load.clientName} • {load.pickupLocation} → {load.dropoffLocation}
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-green-600 flex-shrink-0">
                        €{load.clientPrice}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

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
              {isSubmitting ? "Updating..." : "Update Route"}
            </Button>
          </div>
        </form>
      </div>
    </MobileLayout>
  );
}
