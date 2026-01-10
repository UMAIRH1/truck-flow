"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { validateEmail } from "../validations";
import { Mail, Repeat, Check, Copy } from "lucide-react";

export default function SendEmailPage() {
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState("");

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const initial = params.get("email") || "";
      if (initial) setEmail(initial);
      if (initial) {
        const err = validateEmail(initial);
        if (err) setFieldError("Invalid email provided. Please change it.");
      }
    } catch (e) {}
  }, []);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const emailRef = useRef<HTMLInputElement | null>(null);

  const maskedEmail = useMemo(() => {
    if (!email) return "";
    const [local, domain] = email.split("@");
    if (!domain) return email;
    if (local.length <= 2) return `${local[0]}***@${domain}`;
    return `${local[0]}${"*".repeat(Math.max(2, local.length - 2))}${local.slice(-1)}@${domain}`;
  }, [email]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const handleResend = async () => {
    setMessage("");
    setFieldError("");

    const err = validateEmail(email);
    if (err) {
      setFieldError(err);
      setTimeout(() => emailRef.current?.focus());
      return;
    }

    if (cooldown > 0) return;

    setIsLoading(true);
    try {
      // TODO: call resend API
      await new Promise((res) => setTimeout(res, 800));
      setMessage("Reset email resent. Check your inbox.");
      setCooldown(30);
    } catch {
      setFieldError("Failed to resend email. Try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setMessage("Email copied to clipboard");
    } catch {
      setFieldError("Unable to copy email");
    }
  };

  return (
    <div className="min-h-screen bg-white lg:border my-4 rounded-2xl border-(--color-primary-yellow-dark) flex flex-col px-4 py-4 max-w-md mx-auto space-y-4">
      <div className="h-12" />
      <div className="flex-1 px-6 py-8">
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-full bg-yellow-100 p-4 border border-yellow-200">
            <Mail className="w-8 h-8 text-yellow-600" />
          </div>
          <h1 className="text-2xl font-bold text-center text-(--color-light-black) mb-2">Check your email</h1>
          <p className="text-center text-(--color-yellow-light) mb-8">We've sent a password reset link — just a few more steps to get back in.</p>
        </div>

        <div className="mt-8 space-y-4">
          <label className="block text-sm text-gray-600 mb-2">Email we sent to</label>
          <div className="flex gap-2 items-center">
            <Input ref={emailRef} value={maskedEmail || email || ""} onChange={() => {}} readOnly className="h-12 bg-gray-50 border-gray-200 rounded-lg" />
            <Button type="button" title="Copy email" onClick={handleCopy} className="p-3 rounded-lg bg-gray-100 hover:bg-gray-200">
              <Copy className="w-4 h-4 text-gray-700" />
            </Button>
          </div>
          {fieldError && <p className="text-red-500 text-sm mt-1">{fieldError}</p>}

          <div className="flex gap-2 mt-2">
            <Button type="button" onClick={handleResend} disabled={cooldown > 0 || isLoading} variant="yellow" className="flex-1 h-12 inline-flex items-center justify-center gap-2">
              {cooldown > 0 ? (
                <span className="text-sm">Resend ({cooldown}s)</span>
              ) : isLoading ? (
                "Resending..."
              ) : (
                <>
                  <Repeat className="w-4 h-4" /> Resend
                </>
              )}
            </Button>
          </div>
          <div className="mt-4 text-center">
            <Link href="/auth/forgot-password" className="text-sm text-gray-600 hover:underline">
              Change email
            </Link>
          </div>
          <div aria-live="polite" className="mt-4 text-center">
            {message && (
              <p className="text-sm text-green-600 inline-flex items-center gap-2">
                <Check className="w-4 h-4" />
                {message}
              </p>
            )}
          </div>
          <div className="mt-6 text-center">
            <Link href="/auth/signin">
              <Button variant="yellow" className="w-full h-12">
                Back to sign in
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
