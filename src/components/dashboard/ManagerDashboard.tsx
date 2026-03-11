"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/layout";
import { StatCard, LoadCard, FilterTabs } from "@/components/shared";
import { useLoads } from "@/contexts/LoadContext";
import { DollarSign, Clock, CreditCard, Truck, ArrowRight, ChartColumn, Plus, Users } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { useTranslations } from "next-intl";

interface DashboardStats {
  totalLoads: number;
  acceptedLoads: number;
  completedLoads: number;
  pendingLoads: number;
  declinedLoads: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  pendingPayments: number;
  avgRevenuePerKm: number;
  avgProfitPerKm: number;
  profitPerDriver: Record<string, { profit: number; name?: string }>;
  profitPerTruck: Record<string, number>;
  recentProfitRoutes: Array<{ id: string; name: string; profit: number; date: string }>;
}

export function ManagerDashboard() {
  const { loads, getLoadsByStatus, isLoading, error } = useLoads();
  const [activeTab, setActiveTab] = useState<string>("accepted");
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const t = useTranslations();

  // Fetch dashboard stats from API
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setIsLoadingStats(true);
        const response = await api.getManagerDashboard();
        if (response.success && response.dashboard) {
          setDashboardStats(response.dashboard);
        }
      } catch (error: any) {
        console.error("Failed to fetch dashboard stats:", error);
        // Fallback to calculated stats from loads
        const completedLoads = getLoadsByStatus("completed");
        const acceptedLoads = getLoadsByStatus("accepted");
        const pendingLoads = getLoadsByStatus("pending");

        setDashboardStats({
          totalLoads: loads.length,
          acceptedLoads: acceptedLoads.length,
          completedLoads: completedLoads.length,
          pendingLoads: pendingLoads.length,
          declinedLoads: 0,
          totalRevenue: completedLoads.reduce((sum, load) => sum + load.clientPrice, 0),
          totalCost: 0,
          totalProfit: 0,
          pendingPayments: acceptedLoads.reduce((sum, load) => sum + load.clientPrice, 0),
          avgRevenuePerKm: 0,
          avgProfitPerKm: 0,
          profitPerDriver: {},
          profitPerTruck: {},
          recentProfitRoutes: [],
        });
      } finally {
        setIsLoadingStats(false);
      }
    };

    if (!isLoading && loads.length >= 0) {
      fetchDashboardStats();
    }
  }, [loads, isLoading, getLoadsByStatus]);

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

  const completedLoads = getLoadsByStatus("completed");

  // Use API stats if available, otherwise calculate from loads
  const stats = dashboardStats || {
    totalLoads: loads.length,
    acceptedLoads: 0,
    completedLoads: 0,
    pendingLoads: 0,
    declinedLoads: 0,
    totalRevenue: completedLoads.reduce((sum, load) => sum + load.clientPrice, 0),
    totalCost: 0,
    totalProfit: 0,
    pendingPayments: loads.filter((l) => l.status === "completed" && new Date(l.expectedPayoutDate) > new Date()).reduce((sum, load) => sum + load.clientPrice, 0),
    avgRevenuePerKm: 0,
    avgProfitPerKm: 0,
    profitPerDriver: {},
    profitPerTruck: {},
  };

  const upcomingPayments = loads.filter((l) => l.status === "accepted" || l.status === "in-progress").reduce((sum, load) => sum + load.clientPrice, 0);
  const activeLoadCount = loads.filter((l) => l.status === "accepted" || l.status === "in-progress" || l.status === "pending").length;

  const tabs = [
    { id: "accepted", label: t("tabs.accepted") },
    { id: "pending", label: t("tabs.pending") },
    { id: "completed", label: t("tabs.completed") },
    { id: "rejected", label: t("tabs.rejected") },
  ];

  const filteredLoads = loads.filter((load) => {
    if (activeTab === "accepted") return load.status === "accepted" || load.status === "in-progress";
    if (activeTab === "completed") return load.status === "completed";
    return load.status === activeTab;
  });

  return (
    <div className="min-h-screen">
      <Header title={t("header.dashboard")} />
      <div className=" max-w-7xl mx-auto bg-(--color-yellow-light)">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 px-4 py-6 lg:px-6 rounded-t-2xl md:rounded-none bg-(--color-white)">
          <div className="space-y-4 lg:col-span-1">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
              <StatCard icon={DollarSign} label={t("dashboard.totalRevenue") || "Total Revenue"} value={`€ ${(stats as any).totalRevenue?.toLocaleString() || 0}.00`} className="text-blue-600" />
              <StatCard icon={DollarSign} label={t("dashboard.totalCost") || "Total Cost"} value={`€ ${(stats as any).totalCost?.toLocaleString() || 0}.00`} className="text-red-500" />
              <StatCard icon={DollarSign} label={t("dashboard.totalProfit") || "Total Profit"} value={`€ ${(stats as any).totalProfit?.toLocaleString() || 0}.00`} className="text-green-600 font-bold" />
              <StatCard icon={ArrowRight} label={t("dashboard.avgRevenuePerKm") || "Avg €/km"} value={`€ ${(stats as any).avgRevenuePerKm || 0}`} />
              <StatCard icon={ArrowRight} label={t("dashboard.avgProfitPerKm") || "Profit/km"} value={`€ ${(stats as any).avgProfitPerKm || 0}`} />
              <StatCard icon={Clock} label={t("dashboard.upcomingPayments")} value={`€ ${upcomingPayments.toLocaleString()}.00`} />
              <Link href="/active-loads">
                <StatCard icon={Truck} label={t("dashboard.activeLoads")} value={activeLoadCount} className="hover:shadow-md transition-shadow" />
              </Link>
            </div>
            <Link href="/cashflow" className="block">
              <div className="bg-(--color-yellow-light) rounded-lg p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <ChartColumn className="h-5 w-5 text-[#374957]" />
                  <span className="font-bold text-xs text-(--color-light-black-border)">{t("dashboard.cashflow")}</span>
                </div>
                <ArrowRight className="h-5 w-5 text-[#374957]" />
              </div>
            </Link>
            <Link href="/drivers" className="block">
              <div className="bg-(--color-yellow-light) rounded-lg p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-(--color-light-black-border)" />
                  <span className="font-bold text-sm text-(--color-light-black-border)">{t("dashboard.manageDrivers")}</span>
                </div>
                <ArrowRight className="h-5 w-5 text-(--color-light-black-border)" />
              </div>
            </Link>

            {/* Profit per Driver/Truck (Phase 2 Additions) */}
            {dashboardStats && (
              <div className="space-y-4 pt-4 border-t">
                <div className="bg-white rounded-lg p-4 shadow-sm border">
                  <h3 className="text-sm font-bold mb-3">{t("dashboard.profitPerDriver")}</h3>
                  <div className="space-y-2">
                    {Object.entries(dashboardStats.profitPerDriver || {}).length > 0 ? (
                      Object.entries(dashboardStats.profitPerDriver).map(([id, data]: [string, any]) => (
                        <div key={id} className="flex justify-between text-sm py-1 border-b last:border-0 border-gray-50">
                          <span className="text-gray-600">Driver {id.slice(-4)}</span>
                          <span className="font-medium text-green-600">€ {data.profit.toLocaleString()}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 italic">No data yet</p>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm border">
                  <h3 className="text-sm font-bold mb-3">{t("dashboard.profitPerTruck")}</h3>
                  <div className="space-y-2">
                    {Object.entries(dashboardStats.profitPerTruck || {}).length > 0 ? (
                      Object.entries(dashboardStats.profitPerTruck).map(([num, profit]) => (
                        <div key={num} className="flex justify-between text-sm py-1 border-b last:border-0 border-gray-50">
                           <span className="text-gray-600">{num}</span>
                           <span className="font-medium text-green-600">€ {profit.toLocaleString()}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 italic">No data yet</p>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm border">
                  <h3 className="text-sm font-bold mb-3">{t("dashboard.profitPerRoute") || "Profit per Route"}</h3>
                  <div className="space-y-2">
                    {dashboardStats.recentProfitRoutes && dashboardStats.recentProfitRoutes.length > 0 ? (
                      dashboardStats.recentProfitRoutes.map((route) => (
                        <div key={route.id} className="flex justify-between text-sm py-1 border-b last:border-0 border-gray-50">
                           <span className="text-gray-600">{route.name}</span>
                           <span className="font-medium text-green-600">€ {route.profit.toLocaleString()}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 italic">No data yet</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="lg:col-span-3">
            <div className="flex items-center justify-center lg:justify-between">
              <h2 className="font-semibold text-center text-black">{t("dashboard.dailyLoadDetails")}</h2>
              <div className="hidden lg:flex items-center gap-3">
                <FilterTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
              </div>
            </div>
            <div className="lg:hidden mt-3">
              <FilterTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
            </div>

            <div className="mt-4 flex flex-col gap-3">
              {filteredLoads.length === 0 ? (
                <div className="text-center py-8 text-gray-500">{t("common.noLoadsFound")}</div>
              ) : (
                filteredLoads.slice(0, 8).map((load) => (
                  <div key={load.id} className="w-full">
                    <LoadCard load={load} />
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 text-end lg:hidden">
              <Link href="/active-loads" className="inline-flex items-center gap-2 text-sm text-yellow-500 hover:underline">
                {t("common.viewAll")}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="mt-4 text-right hidden lg:block">
              <Link href="/active-loads" className="text-sm inline-flex items-center gap-2 text-yellow-500 hover:underline">
                {t("common.viewAll")}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
