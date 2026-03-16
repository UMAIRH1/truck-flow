"use client";

import React, { useEffect, useState } from "react";
import { Header, MobileLayout } from "@/components/layout";
import { useRoutes } from "@/contexts/RouteContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter, useParams } from "next/navigation";
import { 
  Truck, MapPin, Calendar, DollarSign, CheckCircle, XCircle, 
  Clock, Package, TrendingUp, Fuel, User, Trash2 
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function RouteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const { routes, acceptRoute, rejectRoute, deleteRoute, loading } = useRoutes();
  const [route, setRoute] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const foundRoute = routes.find(r => r.id === params.id);
    setRoute(foundRoute);
  }, [routes, params.id]);

  const handleAccept = async () => {
    if (!route) return;
    setActionLoading(true);
    try {
      await acceptRoute(route.id);
    } catch (error) {
      console.error("Failed to accept route:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!route) return;
    setActionLoading(true);
    try {
      await rejectRoute(route.id);
    } catch (error) {
      console.error("Failed to reject route:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!route) return;
    
    if (!confirm("Are you sure you want to delete this route? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteRoute(route.id);
      router.push("/routes");
    } catch (error) {
      console.error("Failed to delete route:", error);
      alert("Failed to delete route");
      setIsDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "accepted": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      case "in-progress": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading || !route) {
    return (
      <MobileLayout showFAB={false}>
        <Header title="Route Details" showBack />
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading route...</div>
        </div>
      </MobileLayout>
    );
  }

  const isDriver = user?.role === 'driver';
  const canAcceptReject = isDriver && route.status === 'pending';

  return (
    <MobileLayout showFAB={false}>
      <Header title="Route Details" showBack />
      <div className="px-4 py-6 max-w-4xl mx-auto space-y-6">
        {/* Header Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold">{route.routeName}</h1>
                <p className="text-gray-500">{route.routeNumber}</p>
                {(route.origin || route.destination) && (
                  <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {route.origin || "Origin"} → {route.destination || "Destination"}
                  </p>
                )}
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(route.status)}`}>
                {route.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-2 text-gray-600">
                <User className="h-4 w-4" />
                <div>
                  <div className="text-xs text-gray-500">Driver</div>
                  <div className="font-medium">{route.assignedDriver.name}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Truck className="h-4 w-4" />
                <div>
                  <div className="text-xs text-gray-500">Truck</div>
                  <div className="font-medium">{route.assignedTruck?.truckNumber || 'N/A'}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <div>
                  <div className="text-xs text-gray-500">Start Date</div>
                  <div className="font-medium">{new Date(route.startDate).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <div>
                  <div className="text-xs text-gray-500">Distance</div>
                  <div className="font-medium">{route.totalDistance} km</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-4">Financial Summary</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Total Revenue</div>
                <div className="text-2xl font-bold text-blue-600">€{route.totalRevenue.toFixed(2)}</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Total Cost</div>
                <div className="text-2xl font-bold text-red-600">€{route.totalCost.toFixed(2)}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg col-span-2">
                <div className="text-sm text-gray-600">Net Profit</div>
                <div className="text-3xl font-bold text-green-600">€{route.profit.toFixed(2)}</div>
                <div className="text-sm text-gray-500 mt-1">€{route.profitPerKm.toFixed(2)}/km</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cost Breakdown */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-4">Cost Breakdown</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Fuel className="h-4 w-4 text-gray-500" />
                  <span>Fuel Cost</span>
                </div>
                <span className="font-semibold">€{route.fuelCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>Driver Cost</span>
                </div>
                <span className="font-semibold">€{route.driverCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-gray-500" />
                  <span>Truck Cost</span>
                </div>
                <span className="font-semibold">€{route.truckCost.toFixed(2)}</span>
              </div>
              {route.tolls > 0 && (
                <div className="flex justify-between items-center">
                  <span>Tolls</span>
                  <span className="font-semibold">€{route.tolls.toFixed(2)}</span>
                </div>
              )}
              {route.otherExpenses > 0 && (
                <div className="flex justify-between items-center">
                  <span>Other Expenses</span>
                  <span className="font-semibold">€{route.otherExpenses.toFixed(2)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Loads */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-4">
              Loads ({route.loads.length})
            </h2>
            {route.loads.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No loads attached to this route</p>
            ) : (
              <div className="space-y-3">
                {route.loads.map((load: any) => (
                  <div
                    key={load._id || load}
                    className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/loads/${load._id || load}`)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{load.loadNumber || 'Load'}</div>
                        <div className="text-sm text-gray-600">
                          {load.pickupLocation} → {load.dropoffLocation}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">€{load.clientPrice}</div>
                        <div className="text-xs text-gray-500">{load.distance} km</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        {route.notes && (
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold mb-2">Notes</h2>
              <p className="text-gray-600">{route.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons for Driver */}
        {canAcceptReject && (
          <div className="flex gap-4">
            <Button
              onClick={handleReject}
              disabled={actionLoading}
              variant="outline"
              className="flex-1 border-red-500 text-red-500 hover:bg-red-50"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button
              onClick={handleAccept}
              disabled={actionLoading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Accept
            </Button>
          </div>
        )}

        {/* Edit Button for Manager */}
        {user?.role === 'manager' && route.status === 'pending' && (
          <div className="flex gap-4">
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              variant="outline"
              className="flex-1 border-red-500 text-red-500 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? "Deleting..." : "Delete Route"}
            </Button>
            <Button
              onClick={() => router.push(`/routes/${route.id}/edit`)}
              className="flex-1 bg-black hover:bg-gray-800"
            >
              Edit Route
            </Button>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
