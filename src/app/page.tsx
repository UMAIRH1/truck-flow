"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ManagerDashboard } from "@/components/dashboard/ManagerDashboard";
import { DriverDashboard } from "@/components/dashboard/DriverDashboard";
import { MobileLayout } from "@/components/layout";

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/splash");
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-yellow-400 flex items-center justify-center">
        <div className="text-black font-bold text-2xl">Loading...</div>
      </div>
    );
  }

  // Don't render dashboard if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <MobileLayout>{user?.role === "driver" ? <DriverDashboard /> : <ManagerDashboard />}</MobileLayout>;
}
