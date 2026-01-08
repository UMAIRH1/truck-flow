"use client";

import React from "react";
import { Header } from "@/components/layout";
import { StatCard, DriverLoadCard } from "@/components/shared";
import { useLoads } from "@/contexts/LoadContext";
import { useAuth } from "@/contexts/AuthContext";
import { DollarSign, Clock, CreditCard, Truck, ChevronRight, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function DriverDashboard() {
  const { loads, updateLoadStatus } = useLoads();
  const { user } = useAuth();
  const router = useRouter();

  // Filter loads for this driver
  const driverLoads = loads.filter((load) => load.assignedDriver?.name === user?.name || load.assignedDriver?.id === user?.id);

  const pendingLoads = driverLoads.filter((l) => l.status === "pending");
  const acceptedLoads = driverLoads.filter((l) => l.status === "accepted" || l.status === "in-progress");
  const completedLoads = driverLoads.filter((l) => l.status === "completed");

  // Calculate stats
  const totalEarning = completedLoads.reduce((sum, load) => sum + (load.driverPrice || 0), 0);
  const pendingPayments = acceptedLoads.reduce((sum, load) => sum + (load.driverPrice || 0), 0);

  const handleAccept = (loadId: string) => {
    updateLoadStatus(loadId, "accepted");
  };

  const handleDecline = (loadId: string) => {
    updateLoadStatus(loadId, "rejected");
  };

  const handleMapView = (loadId: string) => {
    router.push(`/map/${loadId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Dashboard" />

      <div className="px-4 py-4 max-w-md mx-auto space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={DollarSign} label="Total Earning" value={`$ ${totalEarning.toLocaleString()}.00`} />
          <StatCard icon={Clock} label="Pending Payments" value={`$ ${pendingPayments.toLocaleString()}.00`} />
        </div>

        {/* New Load Requests Link */}
        <Link href="/my-loads" className="block">
          <div className="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-900">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <span className="font-medium">New Load Requests ({pendingLoads.length})</span>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400" />
          </div>
        </Link>

        {/* Pending Load Requests */}
        <div className="space-y-3">
          {pendingLoads.map((load) => (
            <DriverLoadCard key={load.id} load={load} showActions={true} onAccept={() => handleAccept(load.id)} onDecline={() => handleDecline(load.id)} onMapView={() => handleMapView(load.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}
