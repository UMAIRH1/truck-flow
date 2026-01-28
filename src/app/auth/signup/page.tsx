"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SignUpPage() {
  const router = useRouter();
  
  // Temporarily disabled - signup not available
  React.useEffect(() => {
    router.push("/auth/signin");
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign Up Temporarily Disabled</h1>
        <p className="text-gray-600 mb-6">Please contact your administrator to create an account.</p>
        <Link href="/auth/signin">
          <Button className="bg-yellow-400 hover:bg-yellow-500 text-black">
            Go to Sign In
          </Button>
        </Link>
      </div>
    </div>
  );
}

