"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { Load, Driver, LoadStatus, PaymentTerms } from "@/types";
import api from "@/lib/api";
import socketService from "@/lib/socket";
import { useAuth } from "./AuthContext";

interface LoadContextType {
  loads: Load[];
  drivers: Driver[];
  isLoading: boolean;
  error: string | null;
  addLoad: (load: Omit<Load, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateLoad: (id: string, updates: Partial<Load>) => void;
  deleteLoad: (id: string) => Promise<void>;
  assignDriver: (loadId: string, driver: Driver) => Promise<void>;
  updateLoadStatus: (loadId: string, status: LoadStatus) => Promise<void>;
  startLoad: (loadId: string) => Promise<void>;
  uploadPOD: (loadId: string, images: string[]) => Promise<void>;
  getLoadById: (id: string) => Load | undefined;
  getLoadsByStatus: (status: LoadStatus) => Load[];
  getLoadsByDriver: (driverId: string) => Load[];
  getPendingLoadsForDriver: (driverId: string) => Load[];
  refreshLoads: () => Promise<void>;
  refreshDrivers: () => Promise<void>;
}

const LoadContext = createContext<LoadContextType | undefined>(undefined);

// Transform backend load to frontend format
function transformLoadFromAPI(apiLoad: any): Load {
  return {
    id: apiLoad._id,
    loadNumber: apiLoad.loadNumber,
    routeId: apiLoad.routeId,
    pickupLocation: apiLoad.pickupLocation || "",
    dropoffLocation: apiLoad.dropoffLocation || "",
    pickupCoords: apiLoad.pickupCoords,
    dropoffCoords: apiLoad.dropoffCoords,
    clientName: apiLoad.clientName || "Unknown Client",
    clientPrice: apiLoad.clientPrice || 0,
    driverPrice: apiLoad.driverPrice || 0,
    fuel: apiLoad.fuel || 0,
    tolls: apiLoad.tolls || 0,
    otherExpenses: apiLoad.otherExpenses || 0,
    paymentTerms: apiLoad.paymentTerms || 30,
    expectedPayoutDate: apiLoad.expectedPayoutDate ? new Date(apiLoad.expectedPayoutDate) : new Date(),
    loadingDate: apiLoad.loadingDate ? new Date(apiLoad.loadingDate) : new Date(),
    loadingTime: apiLoad.loadingTime || "00:00",
    shippingType: apiLoad.shippingType || "FTL",
    loadWeight: apiLoad.loadWeight || 0,
    pallets: apiLoad.pallets,
    assignedDriver: apiLoad.assignedDriver ? {
      id: apiLoad.assignedDriver._id || apiLoad.assignedDriver.id || apiLoad.assignedDriver,
      name: apiLoad.assignedDriver.name || "Unknown Driver",
      phone: apiLoad.assignedDriver.phone || "",
      email: apiLoad.assignedDriver.email || "",
      isAvailable: true,
    } : undefined,
    status: apiLoad.status || "pending",
    notes: apiLoad.notes,
    initialImages: apiLoad.initialImages || [],
    podImages: apiLoad.podImage ? [apiLoad.podImage] : apiLoad.podImages || [],
    invoices: apiLoad.invoices || [],
    documents: apiLoad.documents || [],
    createdAt: apiLoad.createdAt ? new Date(apiLoad.createdAt) : new Date(),
    updatedAt: apiLoad.updatedAt ? new Date(apiLoad.updatedAt) : new Date(),
    completedAt: apiLoad.completedAt ? new Date(apiLoad.completedAt) : undefined,
    timeline: apiLoad.timeline || [],
    broadcastTo: apiLoad.broadcastTo ? apiLoad.broadcastTo.map(transformDriverFromAPI) : [],
  };
}

// Transform driver from API
function transformDriverFromAPI(apiDriver: any): Driver {
  return {
    id: apiDriver._id || apiDriver.id,
    name: apiDriver.name,
    phone: apiDriver.phone || "",
    email: apiDriver.email,
    avatar: apiDriver.avatar,
    isAvailable: apiDriver.isActive !== false,
  };
}

export function LoadProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [loads, setLoads] = useState<Load[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch loads from API
  const refreshLoads = useCallback(async () => {
    if (!isAuthenticated) {
      setLoads([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await api.getAllLoads();
      
      if (response.success) {
        const transformedLoads = (response.loads || []).map(transformLoadFromAPI);
        setLoads(transformedLoads);
      }
    } catch (err: any) {
      console.error("Failed to fetch loads:", err);
      setError(err.message || "Failed to fetch loads");
      setLoads([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch drivers from API (manager only)
  const refreshDrivers = useCallback(async () => {
    if (!isAuthenticated || user?.role !== "manager") {
      setDrivers([]);
      return;
    }

    try {
      const response = await api.getAllDrivers();
      
      if (response.success) {
        const transformedDrivers = (response.drivers || []).map(transformDriverFromAPI);
        setDrivers(transformedDrivers);
      }
    } catch (err: any) {
      console.error("Failed to fetch drivers:", err);
      setDrivers([]);
    }
  }, [isAuthenticated, user?.role]);

  // Load data on mount and when auth changes
  useEffect(() => {
    refreshLoads();
    refreshDrivers();
  }, [refreshLoads, refreshDrivers]);

  // WebSocket listener for real-time load updates
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleLoadUpdate = (data: any) => {
      console.log('📦 Real-time load update:', data.action);
      
      switch (data.action) {
        case 'new':
          // A new load was assigned/broadcast to this driver
          if (data.load) {
            const newLoad = transformLoadFromAPI(data.load);
            setLoads((prev) => {
              // Avoid duplicates
              if (prev.some((l) => l.id === newLoad.id)) return prev;
              return [newLoad, ...prev];
            });
          }
          break;
          
        case 'accepted_by_other':
          // Another driver accepted this broadcast load — remove it
          if (data.loadId) {
            setLoads((prev) => prev.filter((l) => l.id !== data.loadId));
          }
          break;

        case 'updated':
          // A load was updated (status change, etc.)
          if (data.load) {
            const updatedLoad = transformLoadFromAPI(data.load);
            setLoads((prev) =>
              prev.map((l) => (l.id === updatedLoad.id ? updatedLoad : l))
            );
          }
          break;

        default:
          break;
      }
    };

    socketService.on('load_update', handleLoadUpdate);

    return () => {
      socketService.off('load_update', handleLoadUpdate);
    };
  }, [isAuthenticated]);

  const addLoad = useCallback(
    async (loadData: Omit<Load, "id" | "createdAt" | "updatedAt">) => {
      try {
        // Send data directly matching UI fields
        const apiLoadData = {
          pickupLocation: loadData.pickupLocation,
          dropoffLocation: loadData.dropoffLocation,
          pickupCoords: loadData.pickupCoords,
          dropoffCoords: loadData.dropoffCoords,
          clientName: loadData.clientName,
          clientPrice: loadData.clientPrice,
          driverPrice: loadData.driverPrice || 0,
          shippingType: loadData.shippingType,
          loadWeight: loadData.loadWeight,
          pallets: loadData.pallets,
          loadingDate: loadData.loadingDate,
          loadingTime: loadData.loadingTime,
          paymentTerms: loadData.paymentTerms,
          fuel: loadData.fuel || 0,
          tolls: loadData.tolls || 0,
          otherExpenses: loadData.otherExpenses || 0,
          notes: loadData.notes,
          driverId: loadData.assignedDriver?.id || undefined,
          initialImages: loadData.initialImages,
        };

        const response = await api.createLoad(apiLoadData);
        
        if (response.success && response.load) {
          const newLoad = transformLoadFromAPI(response.load);
          setLoads((prev) => [newLoad, ...prev]);
        }
      } catch (err: any) {
        console.error("Failed to create load:", err);
        throw new Error(err.message || "Failed to create load");
      }
    },
    []
  );

  const updateLoad = useCallback((id: string, updates: Partial<Load>) => {
    setLoads((prev) =>
      prev.map((load) =>
        load.id === id ? { ...load, ...updates, updatedAt: new Date() } : load
      )
    );
  }, []);

  const deleteLoad = useCallback(async (id: string) => {
    try {
      const response = await api.deleteLoad(id);
      
      if (response.success) {
        setLoads((prev) => prev.filter((load) => load.id !== id));
      }
    } catch (err: any) {
      console.error("Failed to delete load:", err);
      throw new Error(err.message || "Failed to delete load");
    }
  }, []);

  const assignDriver = useCallback(
    async (loadId: string, driver: Driver) => {
      try {
        const response = await api.assignDriver(loadId, driver.id);
        
        if (response.success && response.load) {
          const updatedLoad = transformLoadFromAPI(response.load);
          setLoads((prev) =>
            prev.map((load) => (load.id === loadId ? updatedLoad : load))
          );
        }
      } catch (err: any) {
        console.error("Failed to assign driver:", err);
        throw new Error(err.message || "Failed to assign driver");
      }
    },
    []
  );

  const updateLoadStatus = useCallback(
    async (loadId: string, status: LoadStatus) => {
      try {
        let response;
        
        if (status === "accepted") {
          response = await api.acceptLoad(loadId);
        } else if (status === "rejected") {
          response = await api.declineLoad(loadId);
        } else {
          // For other status updates, just update locally
          updateLoad(loadId, { status });
          return;
        }
        
        if (response.success && response.load) {
          const updatedLoad = transformLoadFromAPI(response.load);
          setLoads((prev) =>
            prev.map((load) => (load.id === loadId ? updatedLoad : load))
          );
        }
      } catch (err: any) {
        console.error("Failed to update load status:", err);
        throw new Error(err.message || "Failed to update load status");
      }
    },
    [updateLoad]
  );

  const startLoad = useCallback(
    async (loadId: string) => {
      try {
        const response = await api.startLoad(loadId);
        
        if (response.success && response.load) {
          const updatedLoad = transformLoadFromAPI(response.load);
          setLoads((prev) =>
            prev.map((load) => (load.id === loadId ? updatedLoad : load))
          );
        }
      } catch (err: any) {
        console.error("Failed to start load journey:", err);
        throw new Error(err.message || "Failed to start load journey");
      }
    },
    []
  );

  const uploadPOD = useCallback(async (loadId: string, images: string[]) => {
    try {
      // Note: This expects image URLs, but the API expects File objects
      // You'll need to handle file upload in the component
      updateLoad(loadId, {
        podImages: images,
        status: "completed",
        completedAt: new Date(),
      });
    } catch (err: any) {
      console.error("Failed to upload POD:", err);
      throw new Error(err.message || "Failed to upload POD");
    }
  }, [updateLoad]);

  const getLoadById = useCallback(
    (id: string) => {
      return loads.find((load) => load.id === id);
    },
    [loads]
  );

  const getLoadsByStatus = useCallback(
    (status: LoadStatus) => {
      return loads.filter((load) => load.status === status);
    },
    [loads]
  );

  const getLoadsByDriver = useCallback(
    (driverId: string) => {
      return loads.filter((load) => load.assignedDriver?.id === driverId);
    },
    [loads]
  );

  const getPendingLoadsForDriver = useCallback(
    (driverId: string) => {
      return loads.filter(
        (load) => load.assignedDriver?.id === driverId && load.status === "pending"
      );
    },
    [loads]
  );

  return (
    <LoadContext.Provider
      value={{
        loads,
        drivers,
        isLoading,
        error,
        addLoad,
        updateLoad,
        deleteLoad,
        assignDriver,
        updateLoadStatus,
        startLoad,
        uploadPOD,
        getLoadById,
        getLoadsByStatus,
        getLoadsByDriver,
        getPendingLoadsForDriver,
        refreshLoads,
        refreshDrivers,
      }}
    >
      {children}
    </LoadContext.Provider>
  );
}

export function useLoads() {
  const context = useContext(LoadContext);
  if (context === undefined) {
    // Fallback for build time
    return {
      loads: [],
      drivers: [],
      isLoading: true,
      error: null,
      addLoad: async () => {},
      updateLoad: () => {},
      deleteLoad: async () => {},
      assignDriver: async () => {},
      updateLoadStatus: async () => {},
      startLoad: async () => {},
      uploadPOD: async () => {},
      getLoadById: () => undefined,
      getLoadsByStatus: () => [],
      getLoadsByDriver: () => [],
      getPendingLoadsForDriver: () => [],
      refreshLoads: async () => {},
      refreshDrivers: async () => {},
    } as LoadContextType;
  }
  return context;
}
