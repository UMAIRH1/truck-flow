"use client";

import { Header, MobileLayout } from "@/components/layout";
import { LineChart } from "@/components/shared";
import { CreditCard, CheckCircle, Clock, XCircle } from "lucide-react";
import AccountDetails from "./_components/AccountDetails";
import Modal from "@/app/settings/_components/modal";
import { aggregateMonthlyMetrics, computeTrend } from "@/lib/earnings";
import { useState } from "react";
import { useLoads } from "@/contexts/LoadContext";
import { useTranslations } from "next-intl";

export default function WalletPage() {
  const t = useTranslations("wallet");
  const { loads } = useLoads();
  const completedLoads = loads.filter((l) => l.status === "completed");
  const chartPoints = aggregateMonthlyMetrics(completedLoads, "income", 3);
  const trend = computeTrend(chartPoints);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get payment history from completed loads
  const paymentHistory = completedLoads.map((load) => {
    const isPaid = load.completedAt && 
      new Date(load.completedAt).getTime() + (load.paymentTerms * 24 * 60 * 60 * 1000) < Date.now();
    
    const expectedPaymentDate = load.completedAt 
      ? new Date(new Date(load.completedAt).getTime() + (load.paymentTerms * 24 * 60 * 60 * 1000))
      : load.expectedPayoutDate;

    const isOverdue = expectedPaymentDate && new Date(expectedPaymentDate) < new Date() && !isPaid;

    return {
      id: load.id,
      loadNumber: load.id,
      amount: load.driverPrice || 0,
      date: load.completedAt || load.createdAt,
      expectedPaymentDate,
      status: isPaid ? "received" : isOverdue ? "overdue" : "pending",
      pickup: load.pickupLocation,
      dropoff: load.dropoffLocation,
    };
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "received":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "overdue":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "received":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const content = (
    <div className="px-4 md:px-6 py-4 md:py-8 max-w-md md:max-w-7xl mx-auto">
      <div className="mb-4">
        <LineChart data={chartPoints} trend={trend} trendLabel={t("last3Months")} className="h-64 md:h-80 lg:h-96" />
      </div>

      <div className="mb-6">
        <AccountDetails />
      </div>

      <div className="mb-4">
        <button
          type="button"
          className="block w-full text-left"
          onClick={() => setIsModalOpen(true)}
        >
          <div className="flex items-center justify-between p-4 md:p-6 text-(--color-light-black-border) bg-(--color-yellow-light) rounded-xl shadow-sm transition-colors hover:bg-yellow-100">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 md:h-6 w-5 md:w-6" />
              <span className="font-medium">{t("paymentMethods")}</span>
            </div>
          </div>
        </button>
      </div>

      {/* Payment History */}
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-4">{t("paymentHistory")}</h2>
        {paymentHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {t("noPaymentHistory")}
          </div>
        ) : (
          <div className="space-y-3">
            {paymentHistory.map((payment) => (
              <div
                key={payment.id}
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-lg">€{payment.amount.toFixed(2)}</span>
                      {getStatusIcon(payment.status)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Load #{payment.loadNumber.slice(-8).toUpperCase()}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {payment.pickup} → {payment.dropoff}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(payment.status)}`}>
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-3 pt-3 border-t">
                  <div>
                    <span className="font-medium">Completed:</span>{" "}
                    {new Date(payment.date).toLocaleDateString()}
                  </div>
                  {payment.expectedPaymentDate && (
                    <div>
                      <span className="font-medium">Expected:</span>{" "}
                      {new Date(payment.expectedPaymentDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t("paymentMethods")} />
    </div>
  );

  return (
    <>
      <div className="block md:hidden">
        <MobileLayout>
          <Header title={t("myWallet")} showBack />
          {content}
        </MobileLayout>
      </div>
      <div className="hidden md:block min-h-screen bg-gray-50">
        <MobileLayout>
          <Header title={t("myWallet")} showBack />
          {content}
        </MobileLayout>
      </div>
    </>
  );
}
