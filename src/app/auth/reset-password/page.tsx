"use client";

import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { validatePassword } from "../validations";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const t = params.get("token");
      if (t) setToken(t);
    } catch (e) {}
  }, []);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ password: "", confirm: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const confirmRef = useRef<HTMLInputElement | null>(null);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({ password: "", confirm: "" });
    setError("");

    if (!token) {
      setError("Invalid or missing reset token. Try again from the Forgot Password page.");
      return;
    }

    const pwError = validatePassword(password);
    if (pwError) {
      setFieldErrors({ password: pwError, confirm: "" });
      setTimeout(() => passwordRef.current?.focus());
      return;
    }

    if (password !== confirmPassword) {
      setFieldErrors({ password: "", confirm: "Passwords do not match" });
      setTimeout(() => confirmRef.current?.focus());
      return;
    }

    setIsLoading(true);
    try {
      // TODO: call API to reset password using token
      router.push("/auth/signin");
    } catch {
      setError("Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white lg:border my-4 rounded-2xl border-(--color-primary-yellow-dark) flex flex-col px-4 py-4 max-w-md mx-auto space-y-4">
      <div className="h-12" />
      <div className="flex-1 px-6 py-8">
        <h1 className="text-2xl font-bold text-center text-(--color-light-black) mb-2">Reset Password</h1>
        <p className="text-center text-(--color-yellow-light) mb-8">Create a new password for your account</p>

        <form noValidate onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm text-gray-600 mb-2">New Password</label>
            <div className="relative">
              <Input
                ref={passwordRef}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 bg-gray-50 border-gray-200 rounded-lg pr-12"
                required
                minLength={8}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {fieldErrors.password && <p className="text-red-500 text-sm mt-1">{fieldErrors.password}</p>}
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">Confirm Password</label>
            <div className="relative">
              <Input
                ref={confirmRef}
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-12 bg-gray-50 border-gray-200 rounded-lg pr-12"
                required
                minLength={8}
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {fieldErrors.confirm && <p className="text-red-500 text-sm mt-1">{fieldErrors.confirm}</p>}
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <Button type="submit" disabled={isLoading} variant="yellow" className="w-full h-12">
            {isLoading ? "Resetting..." : "Reset password"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/auth/signin" className="text-(--color-yellow-light) hover:underline">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
