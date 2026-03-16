"use client";

import React, { useState } from "react";
import { Header, MobileLayout } from "@/components/layout";
import { useRoutes } from "@/contexts/RouteContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Plus, Truck, MapPin, DollarSign, MoreVertical, Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RoutesPage() {
  const router = useRouter();
  const { routes, loading, deleteRoute } = useRoutes();
  const { user } = useAuth();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    if (openMenuId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openMenuId]);

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

  const handleEdit = (e: React.MouseEvent, routeId: string) => {
    e.stopPropagation();
    setOpenMenuId(null);
    router.push(`/routes/${routeId}/edit`);
  };

  const handleDelete = async (e: React.MouseEvent, routeId: string) => {
    e.stopPropagation();
    setOpenMenuId(null);
    
    if (!confirm("Are you sure you want to delete this route?")) {
      return;
    }

    setDeletingId(routeId);
    try {
      await deleteRoute(routeId);
    } catch (error) {
      console.error("Failed to delete route:", error);
      alert("Failed to delete route");
    } finally {
      setDeletingId(null);
    }
  };

  const toggleMenu = (e: React.MouseEvent, routeId: string) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === routeId ? null : routeId);
  };

  return (
    <MobileLayout showFAB={true}>
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
                className="bg-white border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer relative"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{route.routeName}</h3>
                    <p className="text-sm text-gray-500">{route.routeNumber}</p>
                    {(route.origin || route.destination) && (
                      <p className="text-sm text-gray-600 mt-1">
                        {route.origin || "Origin"} → {route.destination || "Destination"}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(route.status)}`}>
                      {route.status}
                    </span>
                    {user?.role === "manager" && (
                      <div className="relative">
                        <button
                          onClick={(e) => toggleMenu(e, route.id)}
                          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                          disabled={deletingId === route.id}
                        >
                          <MoreVertical className="h-5 w-5 text-gray-600" />
                        </button>
                        
                        {openMenuId === route.id && (
                          <div className="absolute right-0 top-8 bg-white border rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                            <button
                              onClick={(e) => handleEdit(e, route.id)}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </button>
                            <button
                              onClick={(e) => handleDelete(e, route.id)}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
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
