"use client";

import React, { useState } from "react";
import { Header } from "@/components/layout";
import { StatCard, LoadCard, FilterTabs } from "@/components/shared";
import { useLoads } from "@/contexts/LoadContext";
import { DollarSign, Clock, CreditCard, Truck, ArrowRight, ChartColumn } from "lucide-react";
import Link from "next/link";

export function ManagerDashboard() {
  const { loads, getLoadsByStatus } = useLoads();
  const [activeTab, setActiveTab] = useState<string>("accepted");
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
    <div className="min-h-screen">
      <Header title="Dashboard" />
      <div className=" max-w-7xl mx-auto bg-(--color-yellow-light)">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4  py-6 lg:px-6 rounded-t-2xl md:rounded-none bg-(--color-white)">
          <div className="space-y-4 lg:col-span-1">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
              <Link href="/total-earning">
                <StatCard icon={DollarSign} label="Total Earning" value={`$ ${totalEarning.toLocaleString()}.00`} className="hover:shadow-md transition-shadow" />
              </Link>
              <StatCard icon={CreditCard} label="Unpaid Amount" value={`$ ${pendingPayments.toLocaleString()}.00`} />
              <StatCard icon={Clock} label="Upcoming Payments" value={`$ ${upcomingPayments.toLocaleString()}.00`} />
              <Link href="/active-loads">
                <StatCard icon={Truck} label="Active Loads" value={activeLoadCount} className="hover:shadow-md transition-shadow" />
              </Link>
            </div>
            <Link href="/cashflow" className="block">
              <div className="bg-(--color-yellow-light) rounded-lg p-6 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <ChartColumn className="h-5 w-5 text-[#374957]" />
                  <span className="font-bold text-xs text-(--color-light-black-border)">CASHFLOW</span>
                </div>
                <ArrowRight className="h-5 w-5 text-[#374957]" />
              </div>
            </Link>
          </div>
          <div className="lg:col-span-2">
            <div className="flex items-center justify-center lg:justify-between">
              <h2 className="font-semibold text-center text-black">Daily load details</h2>
              <div className="hidden lg:flex items-center gap-3">
                <FilterTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
              </div>
            </div>
            <div className="lg:hidden mt-3">
              <FilterTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
            </div>

            <div className="mt-4 flex flex-col gap-3">
              {filteredLoads.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No loads found</div>
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
                View all
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="mt-4 text-right hidden lg:block">
              <Link href="/active-loads" className="text-sm inline-flex items-center gap-2 text-yellow-500 hover:underline">
                View all
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
