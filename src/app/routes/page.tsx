"use client";

import React from "react";
import { Header, MobileLayout } from "@/components/layout";
import { useRoutes } from "@/contexts/RouteContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Plus, Truck, MapPin, DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RoutesPage() {
  const router = useRouter();
  const { routes, loading } = useRoutes();
  const { user } = useAuth();

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

  return (
    <MobileLayout showFAB={false}>
      <Header title="Routes" showBack />
      <div className="px-4 py-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">All Routes</h1>
          {user?.role === "manager" && (
            <Button
              onClick={() => router.push("/routes/create")}
              className="bg-black hover:bg-gray-800"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Route
            </Button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">Loading routes...</div>
        ) : routes.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No routes found. Create your first route!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {routes.map((route) => (
              <div
                key={route.id}
                onClick={() => router.push(`/routes/${route.id}`)}
                className="bg-white border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{route.routeName}</h3>
                    <p className="text-sm text-gray-500">{route.routeNumber}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(route.status)}`}>
                    {route.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Truck className="h-4 w-4" />
                    <span>{route.assignedDriver.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{route.totalDistance} km</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <DollarSign className="h-4 w-4" />
                    <span className="font-semibold text-green-600">
                      €{route.profit.toFixed(2)} profit
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                  {route.loads.length} load(s) • {new Date(route.startDate).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
