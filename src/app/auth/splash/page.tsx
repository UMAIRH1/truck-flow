"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Truck } from "lucide-react";

export default function SplashPage() {
  const router = useRouter();
  const { setSelectedRole, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const handleRoleSelect = (role: "manager" | "driver") => {
    setSelectedRole(role);
    router.push("/auth/signin");
  };

  return (
    <div className="min-h-screen bg-yellow-400 flex flex-col items-center justify-between py-16 px-6">
      {/* Logo Section */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="mb-4">
          <Truck className="w-32 h-32 text-black" strokeWidth={1.5} />
        </div>
        <h1 className="text-4xl font-bold text-black tracking-wide">TRUCKFLOW</h1>
        <p className="text-lg text-black font-medium mt-1">GET LOADS. GET PAID.</p>
      </div>

      {/* Role Selection */}
      <div className="w-full max-w-xs space-y-4">
        <p className="text-center text-black font-medium mb-6">Are you using this platform as a</p>

        <Button onClick={() => handleRoleSelect("manager")} className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-full">
          Transport Manager
        </Button>

        <Button onClick={() => handleRoleSelect("driver")} className="w-full h-12 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-full border-2 border-black">
          Partner or Driver
        </Button>
      </div>
    </div>
  );
}
