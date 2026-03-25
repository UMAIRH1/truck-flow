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
import { GooglePlacesInput, GoogleMapsLoader } from "@/components/shared";
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
  const [preRouteDistance, setPreRouteDistance] = useState<number | null>(null);
  const [routeDistance, setRouteDistance] = useState<number | null>(null);
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);
  const [originSelected, setOriginSelected] = useState(false);
  const [destinationSelected, setDestinationSelected] = useState(false);
  const [driverLocationSelected, setDriverLocationSelected] = useState(false);

  const [originCoords, setOriginCoords] = useState<{lat: number, lng: number} | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<{lat: number, lng: number} | null>(null);
  const [driverStartingCoords, setDriverStartingCoords] = useState<{lat: number, lng: number} | null>(null);

  const [formData, setFormData] = useState({
    routeName: "",
    origin: "",
    destination: "",
    driverStartingLocation: "", // New field for driver's current position
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

  // Calculate distance with waypoints when locations and loads are selected
  useEffect(() => {
    const calculateDistanceWithWaypoints = async () => {
      // Only calculate if origin and destination are selected
      if (!formData.origin || !formData.destination || !originSelected || !destinationSelected) {
        return;
      }

      setIsCalculatingDistance(true);
      try {
        // Build waypoints from selected loads
        const selectedLoads = loads.filter(load => formData.selectedLoadIds.includes(load.id));
        const waypoints: string[] = [];
        
        // Add pickup and delivery locations for each load in sequence
        selectedLoads.forEach(load => {
          if (load.pickupCoords) {
            waypoints.push(`${load.pickupCoords.lat},${load.pickupCoords.lng}`);
          } else if (load.pickupLocation) {
            waypoints.push(load.pickupLocation);
          }
          
          if (load.dropoffCoords) {
            waypoints.push(`${load.dropoffCoords.lat},${load.dropoffCoords.lng}`);
          } else if (load.dropoffLocation) {
            waypoints.push(load.dropoffLocation);
          }
        });

        // Calculate route distance (origin → waypoints → destination)
        // Use coordinates if available for better accuracy
        const startLoc = originCoords ? `${originCoords.lat},${originCoords.lng}` : formData.origin;
        const endLoc = destinationCoords ? `${destinationCoords.lat},${destinationCoords.lng}` : formData.destination;

        const routeResponse = await api.calculateDistance(
          startLoc,
          endLoc,
          waypoints
        );
        
        if (routeResponse.success && routeResponse.distance) {
          setRouteDistance(routeResponse.distance);
        }

        // Calculate pre-route distance if driver starting location is provided
        let preDistance = 0;
        if (formData.driverStartingLocation && (driverLocationSelected || driverStartingCoords)) {
          const preStartLoc = driverStartingCoords ? `${driverStartingCoords.lat},${driverStartingCoords.lng}` : formData.driverStartingLocation;
          
          const preRouteResponse = await api.calculateDistance(
            preStartLoc,
            startLoc
          );
          if (preRouteResponse.success && preRouteResponse.distance) {
            preDistance = preRouteResponse.distance;
            setPreRouteDistance(preDistance);
          }
        } else {
          setPreRouteDistance(0);
        }

        // Set total distance
        const totalDist = (routeResponse.distance || 0) + preDistance;
        setDistance(totalDist);

      } catch (error: any) {
        console.error("Failed to calculate distance:", error);
        setDistance(null);
        setRouteDistance(null);
        setPreRouteDistance(null);
      } finally {
        setIsCalculatingDistance(false);
      }
    };

    calculateDistanceWithWaypoints();
  }, [
    originSelected, 
    destinationSelected, 
    driverLocationSelected,
    formData.origin, 
    formData.destination, 
    formData.driverStartingLocation,
    formData.selectedLoadIds,
    loads,
    originCoords,
    destinationCoords,
    driverStartingCoords
  ]);

  const calculateEconomics = () => {
    if (!distance) return null;

    const fc = parseFloat(formData.fuelConsumption) || 30;
    const fp = parseFloat(formData.fuelPricePerLiter) || 0;
    const ddc = parseFloat(formData.driverDailyCost) || 0;
    const tck = parseFloat(formData.truckCostPerKm) || 0;
    const tolls = parseFloat(formData.tolls) || 0;
    const other = parseFloat(formData.otherExpenses) || 0;

    // Calculate days based on start and end date
    let days = 1;
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    }

    const fuelCost = distance * (fc / 100) * fp;
    const driverCost = ddc * days; 
    const truckCost = distance * tck;
    const totalCost = fuelCost + driverCost + truckCost + tolls + other;

    const selectedLoads = loads.filter(load => formData.selectedLoadIds.includes(load.id));
    const totalRevenue = selectedLoads.reduce((sum, load) => sum + (load.clientPrice || 0), 0);
    const profit = totalRevenue - totalCost;

    return {
      fuelCost,
      driverCost,
      truckCost,
      totalCost,
      totalRevenue,
      profit,
      distance,
      days,
      tolls,
      other
    };
  };

  const economics = calculateEconomics();

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
        originCoords: originCoords || undefined,
        destinationCoords: destinationCoords || undefined,
        driverStartingCoords: driverStartingCoords || undefined,
        driverStartingLocation: formData.driverStartingLocation || undefined,
        totalDistance: distance || 0,
        preRouteDistance: preRouteDistance || 0,
        routeDistance: routeDistance || 0,
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
    <GoogleMapsLoader>
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
                  <label className="block text-sm font-medium mb-2">Driver Current Location</label>
                  <GooglePlacesInput
                    value={formData.driverStartingLocation}
                    onChange={(value) => setFormData({ ...formData, driverStartingLocation: value })}
                    onCoordinatesChange={(lat, lng) => setDriverStartingCoords({ lat, lng })}
                    onPlaceSelected={() => {
                      console.log("Driver location selected");
                      setDriverLocationSelected(true);
                    }}
                    placeholder="e.g., Faisalabad (optional)"
                  />
                  <p className="text-xs text-gray-500 mt-1">Where is the driver currently located?</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Route Origin *</label>
                  <GooglePlacesInput
                    value={formData.origin}
                    onChange={(value) => setFormData({ ...formData, origin: value })}
                    onCoordinatesChange={(lat, lng) => setOriginCoords({ lat, lng })}
                    onPlaceSelected={() => {
                      console.log("Origin place selected");
                      setOriginSelected(true);
                    }}
                    placeholder="e.g., Lahore"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Route Destination *</label>
                  <GooglePlacesInput
                    value={formData.destination}
                    onChange={(value) => setFormData({ ...formData, destination: value })}
                    onCoordinatesChange={(lat, lng) => setDestinationCoords({ lat, lng })}
                    onPlaceSelected={() => {
                      console.log("Destination place selected");
                      setDestinationSelected(true);
                    }}
                    placeholder="e.g., Karachi"
                    required
                  />
                </div>
              </div>

              {(distance !== null || preRouteDistance !== null || routeDistance !== null) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                  {preRouteDistance !== null && preRouteDistance > 0 && (
                    <div className="text-sm text-blue-800 flex items-center justify-between">
                      <span className="font-medium">Pre-Route Distance (Driver → Origin):</span>
                      <span className="font-bold">{preRouteDistance} km</span>
                    </div>
                  )}
                  {routeDistance !== null && (
                    <div className="text-sm text-blue-800 flex items-center justify-between">
                      <span className="font-medium">Route Distance (Origin → Destination):</span>
                      <span className="font-bold">{routeDistance} km</span>
                    </div>
                  )}
                  {distance !== null && (
                    <div className="text-sm text-blue-900 flex items-center justify-between border-t border-blue-300 pt-2">
                      <span className="font-semibold">Total Distance:</span>
                      <span className="font-bold text-lg">{distance} km</span>
                    </div>
                  )}
                </div>
              )}

              {isCalculatingDistance && (
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
                  <span>Calculating distance...</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div>
                  <label className="block text-sm font-medium mb-2">Other Expenses (€)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.otherExpenses}
                    onChange={(e) => setFormData({ ...formData, otherExpenses: e.target.value })}
                    placeholder="e.g., 20"
                  />
                </div>
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
                          {load.pickupLocation} → {load.dropoffLocation}
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-green-600 flex-shrink-0">
                        €{load.clientPrice}
                      </div>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {economics && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <h3 className="text-sm font-semibold mb-3 text-blue-900">Route Economics Summary</h3>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div className="text-gray-600">Total Distance:</div>
                  <div className="font-medium text-right">{economics.distance.toFixed(2)} km</div>
                  
                  <div className="text-gray-600">Trip Duration:</div>
                  <div className="font-medium text-right">{economics.days} {economics.days === 1 ? 'day' : 'days'}</div>

                  <div className="text-gray-600">Est. Fuel Cost:</div>
                  <div className="font-medium text-right">€{economics.fuelCost.toFixed(2)}</div>
                  
                  <div className="text-gray-600">Est. Driver Cost:</div>
                  <div className="font-medium text-right">€{economics.driverCost.toFixed(2)}</div>
                  
                  <div className="text-gray-600">Est. Truck Cost:</div>
                  <div className="font-medium text-right">€{economics.truckCost.toFixed(2)}</div>

                  <div className="text-gray-600">Tolls & Other:</div>
                  <div className="font-medium text-right">€{(economics.tolls + economics.other).toFixed(2)}</div>
                  
                  <div className="border-t border-blue-200 col-span-2 my-1"></div>
                  
                  <div className="font-semibold text-blue-900">Total Est. Cost:</div>
                  <div className="font-bold text-right text-blue-900">€{economics.totalCost.toFixed(2)}</div>
                  
                  <div className="font-semibold text-green-700">Total Revenue:</div>
                  <div className="font-bold text-right text-green-700">€{economics.totalRevenue.toFixed(2)}</div>
                  
                  <div className="border-t-2 border-blue-300 col-span-2 my-1"></div>
                  
                  <div className="text-lg font-bold text-blue-900">Projected Profit:</div>
                  <div className={`text-lg font-bold text-right ${economics.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    €{economics.profit.toFixed(2)}
                  </div>
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
    </GoogleMapsLoader>
  );
}
