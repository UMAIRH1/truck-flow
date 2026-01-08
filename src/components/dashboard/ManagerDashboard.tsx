"use client";

import React, { useState } from "react";
import { Header } from "@/components/layout";
import { StatCard, LoadCard, FilterTabs } from "@/components/shared";
import { useLoads } from "@/contexts/LoadContext";
import { DollarSign, Clock, CreditCard, Truck, ChevronRight, ArrowRight } from "lucide-react";
import Link from "next/link";

export function ManagerDashboard() {
  const { loads, getLoadsByStatus } = useLoads();
  const [activeTab, setActiveTab] = useState<string>("accepted");

  // Calculate stats
  const completedLoads = getLoadsByStatus("completed");
  const totalEarning = completedLoads.reduce((sum, load) => sum + load.clientPrice, 0);
  const pendingPayments = loads.filter((l) => l.status === "completed" && new Date(l.expectedPayoutDate) > new Date()).reduce((sum, load) => sum + load.clientPrice, 0);
  const upcomingPayments = loads.filter((l) => l.status === "accepted" || l.status === "in-progress").reduce((sum, load) => sum + load.clientPrice, 0);
  const activeLoadCount = loads.filter((l) => l.status === "accepted" || l.status === "in-progress" || l.status === "pending").length;

  const tabs = [
    { id: "accepted", label: "Accepted" },
    { id: "pending", label: "Pending" },
    { id: "rejected", label: "Rejected" },
    { id: "dispute", label: "Dispute" },
  ];

  const filteredLoads = loads.filter((load) => {
    if (activeTab === "accepted") return load.status === "accepted" || load.status === "completed";
    return load.status === activeTab;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Dashboard" />

      <div className="px-4 py-4 max-w-md mx-auto space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/total-earning">
            <StatCard icon={DollarSign} label="Total Earning" value={`$ ${totalEarning.toLocaleString()}.00`} className="hover:shadow-md transition-shadow" />
          </Link>
          <StatCard icon={CreditCard} label="Unpaid Amount" value={`$ ${pendingPayments.toLocaleString()}.00`} />
          <StatCard icon={Clock} label="Upcoming Payments" value={`$ ${upcomingPayments.toLocaleString()}.00`} />
          <Link href="/active-loads">
            <StatCard icon={Truck} label="Active Loads" value={activeLoadCount} className="hover:shadow-md transition-shadow" />
          </Link>
        </div>

        {/* Cashflow Link */}
        <Link href="/cashflow" className="block">
          <div className="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-900">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <span className="font-medium">CASHFLOW</span>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400" />
          </div>
        </Link>

        {/* Daily Load Details */}
        <div className="space-y-3">
          <h2 className="text-center font-semibold text-gray-800">Daily load details</h2>

          <FilterTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="space-y-3">
            {filteredLoads.length === 0 ? <div className="text-center py-8 text-gray-500">No loads found</div> : filteredLoads.slice(0, 5).map((load) => <LoadCard key={load.id} load={load} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
