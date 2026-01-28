"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";

export default function VerifyOTPPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"otp" | "password">("otp");

  useEffect(() => {
    if (!email) {
      router.push("/auth/forgot-password");
    }
  }, [email, router]);

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    // Move to password step
    setStep("password");
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.request("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          email,
          otp,
          newPassword,
        }),
      });

      if (response.success) {
        toast.success("Password reset successfully!");
        setTimeout(() => {
          router.push("/auth/signin");
        }, 1000);
      } else {
        setError(response.message || "Failed to reset password");
      }
    } catch (err: any) {
      setError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      const response = await api.request("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      if (response.success) {
        toast.success("OTP resent to your email");
      }
    } catch (err) {
      toast.error("Failed to resend OTP");
    }
  };

  if (!email) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
              {step === "otp" ? (
                <Mail className="h-8 w-8 text-black" />
              ) : (
                <Lock className="h-8 w-8 text-black" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {step === "otp" ? "Verify OTP" : "Reset Password"}
            </h1>
            <p className="text-gray-600">
              {step === "otp" 
                ? `We've sent a 6-digit code to ${email}`
                : "Create a new password for your account"
              }
            </p>
          </div>

          {/* OTP Step */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP
                </label>
                <Input
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="h-12 text-center text-2xl tracking-widest"
                  maxLength={6}
                  required
                />
                <p className="text-xs text-gray-500 mt-1 text-center">
                  OTP expires in 10 minutes
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={otp.length !== 6}
                className="w-full h-12 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-full"
              >
                Verify OTP
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  className="text-sm text-yellow-600 hover:text-yellow-700 font-medium"
                >
                  Didn't receive code? Resend OTP
                </button>
              </div>
            </form>
          )}

          {/* Password Step */}
          {step === "password" && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-12 pr-12"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-12 pr-12"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-full"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Resetting Password...
                  </span>
                ) : (
                  "Reset Password"
                )}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setStep("otp")}
                  className="text-sm text-gray-600 hover:text-gray-700"
                >
                  ← Back to OTP
                </button>
              </div>
            </form>
          )}

          {/* Back to Sign In */}
          <div className="mt-6 text-center">
            <Link href="/auth/signin" className="text-sm text-gray-600 hover:text-gray-700">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
