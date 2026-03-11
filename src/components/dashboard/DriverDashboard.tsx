"use client";
import { Header } from "@/components/layout";
import { StatCard, DriverLoadCard } from "@/components/shared";
import { useLoads } from "@/contexts/LoadContext";
import { useAuth } from "@/contexts/AuthContext";
import { DollarSign, Clock, CreditCard, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Driver } from "@/types";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useTranslations } from "next-intl";

interface DriverDashboardStats {
  assignedLoads: number;
  acceptedLoads: number;
  completedLoads: number;
  declinedLoads: number;
  totalEarnings: number;
  pendingEarnings: number;
}

export function DriverDashboard() {
  const { loads, updateLoadStatus, assignDriver, refreshLoads, isLoading, error } = useLoads();
  const { user } = useAuth();
  const router = useRouter();
  const [dashboardStats, setDashboardStats] = useState<DriverDashboardStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const t = useTranslations();

  // Fetch dashboard stats from API
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setIsLoadingStats(true);
        const response = await api.getDriverDashboard();
        if (response.success && response.dashboard) {
          setDashboardStats(response.dashboard);
        }
      } catch (error: any) {
        console.error("Failed to fetch dashboard stats:", error);
        // Fallback to calculated stats from loads
        const driverLoads = loads.filter((load) => load.assignedDriver?.name === user?.name || load.assignedDriver?.id === user?.id);
        const completedLoads = driverLoads.filter((l) => l.status === "completed");
        const acceptedLoads = driverLoads.filter((l) => l.status === "accepted" || l.status === "in-progress");

        setDashboardStats({
          assignedLoads: driverLoads.filter((l) => l.status === "pending").length,
          acceptedLoads: acceptedLoads.length,
          completedLoads: completedLoads.length,
          declinedLoads: 0,
          totalEarnings: completedLoads.reduce((sum, load) => sum + (load.driverPrice || 0), 0),
          pendingEarnings: acceptedLoads.reduce((sum, load) => sum + (load.driverPrice || 0), 0),
        });
      } finally {
        setIsLoadingStats(false);
      }
    };

    if (!isLoading && loads.length >= 0) {
      fetchDashboardStats();
    }
  }, [loads, isLoading, user]);

  if (isLoading || isLoadingStats) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title={t("header.dashboard")} />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
            <p className="text-gray-600">{t("dashboard.loadingDashboard")}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title={t("header.dashboard")} />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-yellow-400 rounded-lg hover:bg-yellow-500">
              {t("common.retry")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const driverLoads = loads.filter((load) => load.assignedDriver?.name === user?.name || load.assignedDriver?.id === user?.id);
  const pendingLoads = driverLoads.filter((l) => l.status === "pending"); // Driver's pending loads
  const completedLoads = driverLoads.filter((l) => l.status === "completed");
  const acceptedLoads = driverLoads.filter((l) => l.status === "accepted" || l.status === "in-progress");
  const rejectedLoads = driverLoads.filter((l) => l.status === "rejected"); // Driver's rejected loads

  // Use API stats if available, otherwise calculate from loads
  const stats = dashboardStats || {
    totalEarnings: completedLoads.reduce((sum, load) => sum + (load.driverPrice || 0), 0),
    pendingEarnings: acceptedLoads.reduce((sum, load) => sum + (load.driverPrice || 0), 0),
  };

  const handleAccept = async (loadId: string) => {
    try {
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
        await assignDriver(loadId, driver);
      }
      await updateLoadStatus(loadId, "accepted");
    } catch (error) {
      console.error("Failed to accept load:", error);
    }
  };

  const handleStart = async (loadId: string) => {
    try {
      await api.startLoad(loadId);
      await refreshLoads();
    } catch (error) {
      console.error("Failed to start load journey:", error);
    }
  };

  const handleDecline = async (loadId: string) => {
    try {
      await updateLoadStatus(loadId, "rejected");
    } catch (error) {
      console.error("Failed to decline load:", error);
    }
  };

  const handleMapView = (loadId: string) => {
    router.push(`/map/${loadId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title={t("header.dashboard")} />

      <div className="px-6 py-8 max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <StatCard icon={DollarSign} label={t("dashboard.totalEarning")} value={`€ ${stats.totalEarnings.toLocaleString()}.00`} />
              <StatCard icon={Clock} label={t("dashboard.pendingPayments")} value={`€ ${stats.pendingEarnings.toLocaleString()}.00`} />
            </div>
            
            {/* Load Status Cards */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("dashboard.assignedLoads")}</h3>
              <div className="space-y-3">
                <Link href="/my-loads?tab=pending" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                    <span className="text-gray-700">{t("tabs.pending")}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{pendingLoads.length}</span>
                </Link>
                <Link href="/my-loads?tab=accepted" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-gray-700">{t("tabs.accepted")}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{acceptedLoads.length}</span>
                </Link>
                <Link href="/my-loads?tab=rejected" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-gray-700">{t("tabs.rejected")}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{rejectedLoads.length}</span>
                </Link>
                <Link href="/my-loads?tab=completed" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-gray-700">{t("tabs.completed")}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{completedLoads.length}</span>
                </Link>
              </div>
            </div>
          </div>
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xl font-semibold text-gray-900">{t("dashboard.myAssignedLoads")}</h3>
            {driverLoads.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center">
                <p className="text-gray-500">{t("dashboard.noLoadsAssigned")}</p>
              </div>
            ) : (
              <>
                <div className="grid gap-4">
                  {driverLoads.slice(0, 5).map((load) => (
                    <DriverLoadCard 
                      key={load.id} 
                      load={load}
                      showStatusLabel={true}
                      showActions={load.status === "pending" || load.status === "accepted"} 
                      onAccept={() => handleAccept(load.id)} 
                      onDecline={() => handleDecline(load.id)} 
                      onStart={() => handleStart(load.id)}
                      onMapView={() => handleMapView(load.id)} 
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
