"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Load, Driver, LoadStatus, PaymentTerms } from "@/types";

interface LoadContextType {
  loads: Load[];
  drivers: Driver[];
  addLoad: (load: Omit<Load, "id" | "createdAt" | "updatedAt">) => void;
  updateLoad: (id: string, updates: Partial<Load>) => void;
  deleteLoad: (id: string) => void;
  assignDriver: (loadId: string, driver: Driver) => void;
  updateLoadStatus: (loadId: string, status: LoadStatus) => void;
  uploadPOD: (loadId: string, images: string[]) => void;
  getLoadById: (id: string) => Load | undefined;
  getLoadsByStatus: (status: LoadStatus) => Load[];
  getLoadsByDriver: (driverId: string) => Load[];
  getPendingLoadsForDriver: (driverId: string) => Load[];
}

const LoadContext = createContext<LoadContextType | undefined>(undefined);

// Mock drivers
const mockDrivers: Driver[] = [
  { id: "d1", name: "Watson", phone: "+1 234 567 890", email: "watson@example.com", isAvailable: true },
  { id: "d2", name: "Stephene", phone: "+1 234 567 891", email: "stephene@example.com", isAvailable: true },
  { id: "d3", name: "Aviv Noy", phone: "+1 234 567 892", email: "aviv@example.com", isAvailable: true },
  { id: "d4", name: "Smith", phone: "+1 234 567 893", email: "smith@example.com", isAvailable: false },
  { id: "d5", name: "Jhone Doe", phone: "+1 234 567 894", email: "jhone@example.com", isAvailable: true },
];

// Calculate expected payout date
function calculatePayoutDate(loadingDate: Date, terms: PaymentTerms): Date {
  const payout = new Date(loadingDate);
  payout.setDate(payout.getDate() + terms);
  return payout;
}

// Mock loads
const mockLoads: Load[] = [
  {
    id: "L001",
    pickupLocation: "11-12 Oxford St.",
    dropoffLocation: "20 Los Angeles Sq.",
    clientName: "Watson",
    clientPrice: 2000,
    driverPrice: 1200,
    fuel: 150,
    tolls: 60,
    otherExpenses: 40,
    paymentTerms: 45,
    expectedPayoutDate: new Date("2026-02-20"),
    loadingDate: new Date("2026-01-05"),
    loadingTime: "15:00",
    shippingType: "FTL",
    loadWeight: 300,
    assignedDriver: mockDrivers[0],
    status: "completed",
    createdAt: new Date("2026-01-02"),
    updatedAt: new Date("2026-01-06"),
    completedAt: new Date("2026-01-06"),
    timeline: [
      { status: "In progress", date: new Date("2025-12-18T12:00:00"), description: "", completed: true },
      { status: "Delivered", date: new Date("2025-12-20T12:00:00"), description: "", completed: true },
      { status: "Waiting for documents", date: new Date("2025-12-20T09:00:00"), description: "", completed: false },
      { status: "Unpaid", date: new Date("2025-12-20T10:00:00"), description: "", completed: false },
      { status: "Paid & Load Completed", date: new Date("2025-12-21T09:00:00"), description: "", completed: false },
    ],
  },
  {
    id: "L002",
    pickupLocation: "11-12 Oxford St.",
    dropoffLocation: "20 Los Angeles Sq.",
    clientName: "Stephene",
    clientPrice: 140,
    driverPrice: 100,
    paymentTerms: 60,
    expectedPayoutDate: new Date("2026-02-15"),
    loadingDate: new Date("2025-12-18"),
    loadingTime: "16:00",
    shippingType: "LTL",
    loadWeight: 700,
    assignedDriver: mockDrivers[1],
    status: "accepted",
    createdAt: new Date("2025-12-10"),
    updatedAt: new Date("2025-12-18"),
    timeline: [
      { status: "Load assigned", date: new Date("2025-12-10T10:00:00"), description: "", completed: true },
      { status: "In progress", date: new Date("2025-12-18T16:00:00"), description: "", completed: true },
      { status: "Delivered", date: new Date("2025-12-19T14:00:00"), description: "", completed: false },
      { status: "Waiting for payment", date: new Date("2025-12-19T15:00:00"), description: "", completed: false },
    ],
  },
  {
    id: "L003",
    pickupLocation: "11-12 Oxford St.",
    dropoffLocation: "20 Los Angeles Sq.",
    clientName: "Aviv Noy",
    clientPrice: 140,
    driverPrice: 110,
    paymentTerms: 45,
    expectedPayoutDate: new Date("2026-02-01"),
    loadingDate: new Date("2025-12-20"),
    loadingTime: "10:00",
    shippingType: "FTL",
    loadWeight: 700,
    assignedDriver: mockDrivers[2],
    status: "in-progress",
    createdAt: new Date("2025-12-12"),
    updatedAt: new Date("2025-12-20"),
    timeline: [
      { status: "Load assigned", date: new Date("2025-12-12T09:00:00"), description: "", completed: true },
      { status: "In progress", date: new Date("2025-12-20T10:00:00"), description: "", completed: true },
      { status: "En route", date: new Date("2025-12-20T12:00:00"), description: "", completed: false },
      { status: "Delivered", date: new Date("2025-12-21T08:00:00"), description: "", completed: false },
    ],
  },
  {
    id: "L004",
    pickupLocation: "11-12 Oxford St.",
    dropoffLocation: "20 Los Angeles Sq.",
    clientName: "Watson",
    clientPrice: 300,
    driverPrice: 180,
    fuel: 30,
    tolls: 10,
    otherExpenses: 5,
    paymentTerms: 30,
    expectedPayoutDate: new Date("2026-01-20"),
    loadingDate: new Date("2025-12-21"),
    loadingTime: "14:00",
    shippingType: "Partial",
    loadWeight: 300,
    assignedDriver: mockDrivers[0],
    status: "completed",
    createdAt: new Date("2025-12-18"),
    updatedAt: new Date("2025-12-22"),
    completedAt: new Date("2025-12-22"),
    timeline: [
      { status: "Load assigned", date: new Date("2025-12-18T11:00:00"), description: "", completed: true },
      { status: "In progress", date: new Date("2025-12-21T14:00:00"), description: "", completed: true },
      { status: "Delivered", date: new Date("2025-12-22T10:00:00"), description: "", completed: true },
      { status: "Documents submitted", date: new Date("2025-12-22T11:00:00"), description: "", completed: true },
      { status: "Paid", date: new Date("2025-12-23T09:00:00"), description: "", completed: false },
    ],
  },
  {
    id: "L005",
    pickupLocation: "11-12 Oxford St.",
    dropoffLocation: "20 Los Angeles Sq.",
    clientName: "Smith",
    clientPrice: 800,
    driverPrice: 500,
    fuel: 60,
    tolls: 20,
    otherExpenses: 10,
    paymentTerms: 45,
    expectedPayoutDate: new Date("2026-02-05"),
    loadingDate: new Date("2025-12-15"),
    loadingTime: "09:00",
    shippingType: "FTL",
    loadWeight: 300,
    assignedDriver: mockDrivers[3],
    status: "completed",
    createdAt: new Date("2025-12-13"),
    updatedAt: new Date("2025-12-16"),
    completedAt: new Date("2025-12-16"),
    timeline: [
      { status: "Load assigned", date: new Date("2025-12-13T08:00:00"), description: "", completed: true },
      { status: "In progress", date: new Date("2025-12-15T09:00:00"), description: "", completed: true },
      { status: "Delivered", date: new Date("2025-12-16T14:00:00"), description: "", completed: true },
      { status: "Paid", date: new Date("2025-12-17T10:00:00"), description: "", completed: false },
    ],
  },
  {
    id: "L006",
    pickupLocation: "11-12 Oxford St.",
    dropoffLocation: "20 Los Angeles Sq.",
    clientName: "Jhone Doe",
    clientPrice: 10,
    driverPrice: 8,
    paymentTerms: 60,
    expectedPayoutDate: new Date("2026-02-20"),
    loadingDate: new Date("2025-12-23"),
    loadingTime: "11:00",
    shippingType: "LTL",
    loadWeight: 300,
    status: "pending",
    createdAt: new Date("2025-12-20"),
    updatedAt: new Date("2025-12-20"),
    timeline: [
      { status: "Load created", date: new Date("2025-12-20T12:00:00"), description: "", completed: true },
      { status: "Waiting for driver assignment", date: new Date("2025-12-20T13:00:00"), description: "", completed: false },
    ],
  },
  {
    id: "L007",
    pickupLocation: "11-12 Oxford St.",
    dropoffLocation: "20 Los Angeles Sq.",
    clientName: "Jenna",
    clientPrice: 1500,
    driverPrice: 900,
    fuel: 80,
    tolls: 30,
    otherExpenses: 20,
    paymentTerms: 60,
    expectedPayoutDate: new Date("2025-12-15"),
    loadingDate: new Date("2025-11-10"),
    loadingTime: "08:00",
    shippingType: "LTL",
    loadWeight: 500,
    assignedDriver: mockDrivers[4],
    status: "completed",
    createdAt: new Date("2025-11-08"),
    updatedAt: new Date("2025-11-11"),
    completedAt: new Date("2025-11-11"),
    timeline: [
      { status: "Load assigned", date: new Date("2025-11-08T07:00:00"), description: "", completed: true },
      { status: "In progress", date: new Date("2025-11-10T08:00:00"), description: "", completed: true },
      { status: "Delivered", date: new Date("2025-11-11T16:00:00"), description: "", completed: true },
      { status: "Paid", date: new Date("2025-11-12T09:00:00"), description: "", completed: false },
    ],
  },
  {
    id: "L008",
    pickupLocation: "11-12 Oxford St.",
    dropoffLocation: "20 Los Angeles Sq.",
    clientName: "Oscar",
    clientPrice: 600,
    driverPrice: 300,
    fuel: 20,
    tolls: 10,
    otherExpenses: 5,
    paymentTerms: 45,
    expectedPayoutDate: new Date("2025-12-20"),
    loadingDate: new Date("2025-12-05"),
    loadingTime: "10:00",
    shippingType: "FTL",
    loadWeight: 400,
    status: "completed",
    createdAt: new Date("2025-12-01"),
    updatedAt: new Date("2025-12-06"),
    completedAt: new Date("2025-12-06"),
    timeline: [
      { status: "Load assigned", date: new Date("2025-12-01T09:00:00"), description: "", completed: false },
      { status: "In progress", date: new Date("2025-12-05T10:00:00"), description: "", completed: false },
      { status: "Delivered", date: new Date("2025-12-06T15:00:00"), description: "", completed: false },
      { status: "Paid", date: new Date("2025-12-07T11:00:00"), description: "", completed: false },
    ],
  },
];

export function LoadProvider({ children }: { children: ReactNode }) {
  const [loads, setLoads] = useState<Load[]>(mockLoads);
  const [drivers] = useState<Driver[]>(mockDrivers);

  const addLoad = useCallback(
    (loadData: Omit<Load, "id" | "createdAt" | "updatedAt">) => {
      const newLoad: Load = {
        ...loadData,
        id: `L${String(loads.length + 1).padStart(3, "0")}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setLoads((prev) => [...prev, newLoad]);
    },
    [loads.length]
  );

  const updateLoad = useCallback((id: string, updates: Partial<Load>) => {
    setLoads((prev) => prev.map((load) => (load.id === id ? { ...load, ...updates, updatedAt: new Date() } : load)));
  }, []);

  const deleteLoad = useCallback((id: string) => {
    setLoads((prev) => prev.filter((load) => load.id !== id));
  }, []);

  const assignDriver = useCallback(
    (loadId: string, driver: Driver) => {
      updateLoad(loadId, { assignedDriver: driver });
    },
    [updateLoad]
  );

  const updateLoadStatus = useCallback(
    (loadId: string, status: LoadStatus) => {
      const updates: Partial<Load> = { status };
      if (status === "completed") {
        updates.completedAt = new Date();
      }
      updateLoad(loadId, updates);
    },
    [updateLoad]
  );

  const uploadPOD = useCallback((loadId: string, images: string[]) => {
    setLoads((prev) => prev.map((load) => (load.id === loadId ? { ...load, podImages: [...(load.podImages || []), ...images], updatedAt: new Date() } : load)));
  }, []);

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
      return loads.filter((load) => load.assignedDriver?.id === driverId && load.status === "pending");
    },
    [loads]
  );

  return (
    <LoadContext.Provider
      value={{
        loads,
        drivers,
        addLoad,
        updateLoad,
        deleteLoad,
        assignDriver,
        updateLoadStatus,
        uploadPOD,
        getLoadById,
        getLoadsByStatus,
        getLoadsByDriver,
        getPendingLoadsForDriver,
      }}
    >
      {children}
    </LoadContext.Provider>
  );
}

export function useLoads() {
  const context = useContext(LoadContext);
  if (context === undefined) {
    throw new Error("useLoads must be used within a LoadProvider");
  }
  return context;
}
