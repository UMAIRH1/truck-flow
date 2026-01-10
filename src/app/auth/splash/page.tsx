"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Truck } from "lucide-react";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { ASSETS } from "@/lib/assets";

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
    <div className="min-h-screen bg-(--color-yellow) flex flex-col items-center justify-between py-16 px-6">
      <div className="flex-1 flex flex-col items-center justify-center">
        <OptimizedImage src={ASSETS.images.icons.logo} alt="logo" />
      </div>
      <div className="w-full max-w-xs space-y-4">
        <p className="text-center text-black font-medium ">Are you using this platform as a</p>

        <Button variant="role" onClick={() => handleRoleSelect("manager")} className="w-full h-12 ">
          Transport Manager
        </Button>

        <Button variant="role" onClick={() => handleRoleSelect("driver")} className="w-full h-12">
          Partner or Driver
        </Button>
      </div>
    </div>
  );
}
