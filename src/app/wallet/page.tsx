"use client";

import React, { useState } from "react";
import { Header, MobileLayout } from "@/components/layout";
import { LineChart, StatCard } from "@/components/shared";
import { useLoads } from "@/contexts/LoadContext";
import { useAuth } from "@/contexts/AuthContext";
import { DollarSign, Clock, Truck, CreditCard, ChevronRight, Upload, FileText } from "lucide-react";
import Link from "next/link";

export default function WalletPage() {
  const { loads } = useLoads();
  const { user } = useAuth();

  // Filter loads for this driver
  const driverLoads = loads.filter((load) => load.assignedDriver?.name === user?.name || load.assignedDriver?.id === user?.id);

  const completedLoads = driverLoads.filter((l) => l.status === "completed");
  const pendingLoads = driverLoads.filter((l) => l.status === "accepted" || l.status === "in-progress");

  // Calculate stats
  const totalEarning = completedLoads.reduce((sum, load) => sum + (load.driverPrice || 0), 0);
  const pendingPayments = pendingLoads.reduce((sum, load) => sum + (load.driverPrice || 0), 0);
  const paidLoads = completedLoads.length;
  const cancelledAmount = 2000; // Mock data

  return (
    <MobileLayout>
      <Header title="My Wallet" showBack />

      <div className="px-4 py-4 max-w-md mx-auto space-y-4">
        {/* Chart */}
        <LineChart trend="+5%" trendLabel="Last 3 Months" labels={["Oct", "Nov", "Dec"]} />

        {/* Account Details */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="text-sm text-gray-500 mb-3">Account Details</h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <span className="text-xs text-gray-500">Total Earning</span>
              </div>
              <p className="font-semibold">$ {(totalEarning || 12000).toLocaleString()}.00</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-xs text-gray-500">Pending Payments</span>
              </div>
              <p className="font-semibold">$ {(pendingPayments || 3000).toLocaleString()}.00</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Truck className="h-4 w-4 text-gray-500" />
                <span className="text-xs text-gray-500">Paid Loads</span>
              </div>
              <p className="font-semibold">$ {(paidLoads * 1000 || 9000).toLocaleString()}.00</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className="h-4 w-4 text-gray-500" />
                <span className="text-xs text-gray-500">Cancelled Amount</span>
              </div>
              <p className="font-semibold">$ {cancelledAmount.toLocaleString()}.00</p>
            </div>
          </div>
        </div>

        {/* Action Links */}
        <div className="space-y-2">
          <Link href="/wallet/payment-methods">
            <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-gray-600" />
                <span className="font-medium">Payment Methods</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </Link>

          <Link href="/wallet/upload-invoice">
            <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <Upload className="h-5 w-5 text-gray-600" />
                <span className="font-medium">Upload Invoice</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </Link>

          <Link href="/wallet/upload-documents">
            <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-gray-600" />
                <span className="font-medium">Upload Documents</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </Link>
        </div>
      </div>
    </MobileLayout>
  );
}
