"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { validateEmail } from "../validations";
import { useTranslations } from "next-intl";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState("");
  const emailRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldError("");

    const emailError = validateEmail(email);
    if (emailError) {
      setFieldError(emailError);
      setTimeout(() => emailRef.current?.focus());
      return;
    }

    setIsLoading(true);
    try {
      const api = (await import("@/lib/api")).default;
      const response = await api.request("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      if (response.success) {
        // Redirect to OTP verification page
        router.push(`/auth/verify-otp?email=${encodeURIComponent(email)}`);
      } else {
        setError(response.message || "Failed to send OTP. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white lg:border my-4 rounded-2xl border-(--color-primary-yellow-dark) flex flex-col px-4 py-4 max-w-md mx-auto space-y-4">
      <div className="h-16" />
      <div className="flex-1 px-6 py-8">
        <h1 className="text-2xl font-bold text-center text-(--color-light-black) mb-2">{t("forgotPassword")}</h1>
        <p className="text-center text-(--color-yellow-light) mb-8">{t("enterEmailForReset")}</p>

        <form noValidate onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm text-gray-600 mb-2">{t("emailAddress")}</label>
            <Input
              ref={emailRef}
              type="email"
              placeholder="hello@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 bg-gray-50 border-gray-200 rounded-lg"
              required
            />
            {fieldError && <p className="text-red-500 text-sm mt-1">{fieldError}</p>}
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <Button type="submit" variant="yellow" disabled={isLoading} className="w-full h-12">
            {isLoading ? t("sending") : t("sendResetLink")}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/auth/signin" className="text-(--color-yellow-light) hover:underline">
            {t("backToSignIn")}
          </Link>
        </div>
      </div>
    </div>
  );
}
