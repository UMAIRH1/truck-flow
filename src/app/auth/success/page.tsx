"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { PartyPopper } from "lucide-react";

export default function SuccessPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // Redirect to home after 5 seconds if authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      const timer = setTimeout(() => {
        router.push("/");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Status Bar Space */}
      <div className="h-12" />

      {/* Content */}
      <div className="flex-1 px-6 py-16 flex flex-col items-center justify-center">
        {/* Celebration Icon */}
        <div className="mb-8 relative">
          <div className="w-32 h-32 flex items-center justify-center">
            <PartyPopper className="w-24 h-24 text-yellow-400" strokeWidth={1.5} />
          </div>
          {/* Confetti decorations */}
          <div className="absolute -top-4 -right-4 w-4 h-4 bg-red-400 rounded-full" />
          <div className="absolute top-0 left-0 w-3 h-3 bg-blue-400 rounded-full" />
          <div className="absolute -bottom-2 right-4 w-2 h-2 bg-green-400 rounded-full" />
          <div className="absolute bottom-4 -left-4 w-3 h-3 bg-purple-400 rounded-full" />
          <div className="absolute top-8 -right-8 w-2 h-2 bg-pink-400 rounded-full" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">Congratulations!</h1>

        {/* Message */}
        <div className="text-center text-gray-600 space-y-4 max-w-xs">
          <p>We&apos;ve sent you a verification email, please check your inbox and follow the instructions to verify your account.</p>
          <p>Thank you for signing up with us!</p>
        </div>

        {/* Sign In Link */}
        <div className="mt-12">
          <Link href="/" className="text-yellow-500 hover:underline font-medium">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
