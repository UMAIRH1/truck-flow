"use client";
import { Header } from "@/components/layout";
import { StatCard, DriverLoadCard } from "@/components/shared";
import { useLoads } from "@/contexts/LoadContext";
import { useAuth } from "@/contexts/AuthContext";
import { DollarSign, Clock, CreditCard, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Driver } from "@/types";

export function DriverDashboard() {
  const { loads, updateLoadStatus, assignDriver } = useLoads();
  const { user } = useAuth();
  const router = useRouter();
  const driverLoads = loads.filter((load) => load.assignedDriver?.name === user?.name || load.assignedDriver?.id === user?.id);
  const pendingLoads = loads.filter((l) => l.status === "pending" && !l.assignedDriver); // Available pending loads
  const acceptedLoads = driverLoads.filter((l) => l.status === "accepted" || l.status === "in-progress");
  const completedLoads = driverLoads.filter((l) => l.status === "completed");
  const totalEarning = completedLoads.reduce((sum, load) => sum + (load.driverPrice || 0), 0);
  const pendingPayments = acceptedLoads.reduce((sum, load) => sum + (load.driverPrice || 0), 0);
  const handleAccept = (loadId: string) => {
    const load = loads.find((l) => l.id === loadId);
    if (load && !load.assignedDriver && user) {
      const driver: Driver = {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        avatar: user.avatar,
        isAvailable: true,
      };
      assignDriver(loadId, driver);
    }
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

      <div className="px-6 py-8 max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="grid grid-cols-2 mb-3 gap-6">
              <StatCard icon={DollarSign} label="Total Earning" value={`$ ${totalEarning.toLocaleString()}.00`} />
              <StatCard icon={Clock} label="Pending Payments" value={`$ ${pendingPayments.toLocaleString()}.00`} />
            </div>
            <Link href="/my-loads" className="block">
              <div className="bg-white rounded-xl p-6 flex items-center justify-between shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-gray-900">
                    <CreditCard className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <span className="font-semibold text-lg">New Load Requests</span>
                    <p className="text-gray-600 text-sm">{pendingLoads.length} available</p>
                  </div>
                </div>
                <ArrowRight className="h-6 w-6 text-gray-400" />
              </div>
            </Link>
          </div>
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xl font-semibold text-gray-900">Recent Load Requests</h3>
            <div className="grid gap-4">
              {pendingLoads.slice(0, 3).map((load) => (
                <DriverLoadCard key={load.id} load={load} showActions={true} onAccept={() => handleAccept(load.id)} onDecline={() => handleDecline(load.id)} onMapView={() => handleMapView(load.id)} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
