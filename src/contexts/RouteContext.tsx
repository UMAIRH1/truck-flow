"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/api";
import { Route } from "@/types/route";
import { useAuth } from "./AuthContext";

interface RouteContextType {
  routes: Route[];
  loading: boolean;
  error: string | null;
  fetchRoutes: () => Promise<void>;
  createRoute: (routeData: any) => Promise<void>;
  updateRoute: (id: string, routeData: any) => Promise<void>;
  deleteRoute: (id: string) => Promise<void>;
  acceptRoute: (id: string) => Promise<void>;
  rejectRoute: (id: string) => Promise<void>;
  startRoute: (id: string) => Promise<void>;
  completeRoute: (id: string) => Promise<void>;
  addLoadsToRoute: (routeId: string, loadIds: string[]) => Promise<void>;
  removeLoadFromRoute: (routeId: string, loadId: string) => Promise<void>;
  uploadDocuments: (routeId: string, data: { invoices?: string[]; documents?: string[]; podImage?: string }) => Promise<void>;
}

const RouteContext = createContext<RouteContextType | undefined>(undefined);

export function RouteProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transformRoute = (apiRoute: any): Route => {
    return {
      id: apiRoute._id,
      routeName: apiRoute.routeName,
      routeNumber: apiRoute.routeNumber,
      origin: apiRoute.origin,
      destination: apiRoute.destination,
      driverStartingLocation: apiRoute.driverStartingLocation,
      originCoords: apiRoute.originCoords,
      destinationCoords: apiRoute.destinationCoords,
      driverStartingCoords: apiRoute.driverStartingCoords,
      assignedDriver: {
        id: apiRoute.assignedDriver?._id || apiRoute.assignedDriver,
        name: apiRoute.assignedDriver?.name || "",
        email: apiRoute.assignedDriver?.email || "",
        phone: apiRoute.assignedDriver?.phone || "",
      },
      assignedTruck: apiRoute.assignedTruck,
      startDate: new Date(apiRoute.startDate),
      endDate: apiRoute.endDate ? new Date(apiRoute.endDate) : undefined,
      status: apiRoute.status,
      loads: apiRoute.loads || [],
      loadSequence: apiRoute.loadSequence || [],
      totalDistance: apiRoute.totalDistance || 0,
      preRouteDistance: apiRoute.preRouteDistance || 0,
      routeDistance: apiRoute.routeDistance || 0,
      fuelConsumption: apiRoute.fuelConsumption || 30,
      fuelPricePerLiter: apiRoute.fuelPricePerLiter || 0,
      driverDailyCost: apiRoute.driverDailyCost || 0,
      truckCostPerKm: apiRoute.truckCostPerKm || 0,
      fuelCost: apiRoute.fuelCost || 0,
      driverCost: apiRoute.driverCost || 0,
      truckCost: apiRoute.truckCost || 0,
      totalCost: apiRoute.totalCost || 0,
      totalRevenue: apiRoute.totalRevenue || 0,
      profit: apiRoute.profit || 0,
      profitPerKm: apiRoute.profitPerKm || 0,
      tolls: apiRoute.tolls || 0,
      otherExpenses: apiRoute.otherExpenses || 0,
      notes: apiRoute.notes,
      podImage: apiRoute.podImage || "",
      invoices: apiRoute.invoices || [],
      documents: apiRoute.documents || [],
      createdBy: {
        id: apiRoute.createdBy?._id || apiRoute.createdBy,
        name: apiRoute.createdBy?.name || "",
        email: apiRoute.createdBy?.email || "",
      },
      createdAt: new Date(apiRoute.createdAt),
      updatedAt: new Date(apiRoute.updatedAt),
      completedAt: apiRoute.completedAt ? new Date(apiRoute.completedAt) : undefined,
    } as any;
  };

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const response = await api.getAllRoutes();
      if (response.success && response.routes) {
        setRoutes(response.routes.map(transformRoute));
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch routes");
      console.error("Failed to fetch routes:", err);
    } finally {
      setLoading(false);
    }
  };

  const createRoute = async (routeData: any) => {
    try {
      const response = await api.createRoute(routeData);
      if (response.success && response.route) {
        setRoutes((prev) => [transformRoute(response.route), ...prev]);
      }
    } catch (err: any) {
      throw new Error(err.message || "Failed to create route");
    }
  };

  const updateRoute = async (id: string, routeData: any) => {
    try {
      const response = await api.updateRoute(id, routeData);
      if (response.success && response.route) {
        setRoutes((prev) =>
          prev.map((route) =>
            route.id === id ? transformRoute(response.route) : route
          )
        );
      }
    } catch (err: any) {
      throw new Error(err.message || "Failed to update route");
    }
  };

  const deleteRoute = async (id: string) => {
    try {
      await api.deleteRoute(id);
      setRoutes((prev) => prev.filter((route) => route.id !== id));
    } catch (err: any) {
      throw new Error(err.message || "Failed to delete route");
    }
  };

  const acceptRoute = async (id: string) => {
    try {
      const response = await api.acceptRoute(id);
      if (response.success && response.route) {
        setRoutes((prev) =>
          prev.map((route) =>
            route.id === id ? transformRoute(response.route) : route
          )
        );
      }
    } catch (err: any) {
      throw new Error(err.message || "Failed to accept route");
    }
  };

  const rejectRoute = async (id: string) => {
    try {
      const response = await api.rejectRoute(id);
      if (response.success && response.route) {
        setRoutes((prev) =>
          prev.map((route) =>
            route.id === id ? transformRoute(response.route) : route
          )
        );
      }
    } catch (err: any) {
      throw new Error(err.message || "Failed to reject route");
    }
  };

  const startRoute = async (id: string) => {
    try {
      const response = await api.startRoute(id);
      if (response.success && response.route) {
        setRoutes((prev) =>
          prev.map((route) =>
            route.id === id ? transformRoute(response.route) : route
          )
        );
      }
    } catch (err: any) {
      throw new Error(err.message || "Failed to start route");
    }
  };

  const completeRoute = async (id: string) => {
    try {
      const response = await api.completeRoute(id);
      if (response.success && response.route) {
        setRoutes((prev) =>
          prev.map((route) =>
            route.id === id ? transformRoute(response.route) : route
          )
        );
      }
    } catch (err: any) {
      throw new Error(err.message || "Failed to complete route");
    }
  };

  const uploadDocuments = async (routeId: string, data: { invoices?: string[]; documents?: string[]; podImage?: string }) => {
    try {
      setLoading(true);
      const response = await api.uploadRouteDocuments(routeId, data);
      if (response.success && response.route) {
        setRoutes((prev) =>
          prev.map((route) =>
            route.id === routeId ? transformRoute(response.route) : route
          )
        );
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to upload documents");
      console.error("Failed to upload documents:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addLoadsToRoute = async (routeId: string, loadIds: string[]) => {
    try {
      const response = await api.addLoadsToRoute(routeId, loadIds);
      if (response.success && response.route) {
        setRoutes((prev) =>
          prev.map((route) =>
            route.id === routeId ? transformRoute(response.route) : route
          )
        );
      }
    } catch (err: any) {
      throw new Error(err.message || "Failed to add loads to route");
    }
  };

  const removeLoadFromRoute = async (routeId: string, loadId: string) => {
    try {
      const response = await api.removeLoadFromRoute(routeId, loadId);
      if (response.success && response.route) {
        setRoutes((prev) =>
          prev.map((route) =>
            route.id === routeId ? transformRoute(response.route) : route
          )
        );
      }
    } catch (err: any) {
      throw new Error(err.message || "Failed to remove load from route");
    }
  };

  useEffect(() => {
    // Only fetch routes when user is authenticated and auth check is complete
    if (!authLoading && isAuthenticated) {
      fetchRoutes();
    }
  }, [authLoading, isAuthenticated]);

  return (
    <RouteContext.Provider
      value={{
        routes,
        loading,
        error,
        fetchRoutes,
        createRoute,
        updateRoute,
        deleteRoute,
        acceptRoute,
        rejectRoute,
        startRoute,
        completeRoute,
        addLoadsToRoute,
        removeLoadFromRoute,
        uploadDocuments,
      }}
    >
      {children}
    </RouteContext.Provider>
  );
}

export function useRoutes() {
  const context = useContext(RouteContext);
  if (context === undefined) {
    throw new Error("useRoutes must be used within a RouteProvider");
  }
  return context;
}
