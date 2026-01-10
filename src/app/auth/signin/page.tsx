"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { validateSignInForm } from "../validations";
import { Eye, EyeOff } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const { login, loginWithGoogle, selectedRole, isAuthenticated } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" });

  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  React.useEffect(() => {
    if (!selectedRole) {
      router.push("/auth/splash");
    }
  }, [selectedRole, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({ email: "", password: "" });

    const { emailError, passwordError } = validateSignInForm(email, password);
    if (emailError || passwordError) {
      setFieldErrors({ email: emailError || "", password: passwordError || "" });
      // focus first invalid field
      setTimeout(() => {
        if (emailError) emailRef.current?.focus();
        else if (passwordError) passwordRef.current?.focus();
      });
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password);
      router.push("/");
    } catch {
      setError("Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
      router.push("/");
    } catch {
      setError("Google sign in failed");
    } finally {
      setIsLoading(false);
    }
  };

  const roleTitle = selectedRole === "manager" ? "Manager" : "Driver";

  return (
    <div className="min-h-screen bg-white lg:border my-4 rounded-2xl border-(--color-primary-yellow-dark) flex flex-col px-4 py-4 max-w-md mx-auto space-y-4">
      <div className="flex-1 px-6 py-4">
        <h1 className="text-2xl font-bold text-center text-(--color-light-black) mb-2">Login</h1>
        <p className="text-center text-(--color-yellow-light) mb-8">Welcome back to the app</p>

        <form noValidate onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm text-gray-600 mb-2">Email Address</label>
            <Input
              ref={emailRef}
              type="email"
              placeholder="hello@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 bg-gray-50 border-gray-200 rounded-lg"
              required
            />
            {fieldErrors.email && <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>}
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm text-gray-600">Password</label>
              <Link href="/auth/forgot-password" className="text-sm text-(--color-yellow-light) hover:underline">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Input
                ref={passwordRef}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 bg-gray-50 border-gray-200 rounded-lg pr-12"
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {fieldErrors.password && <p className="text-red-500 text-sm mt-1">{fieldErrors.password}</p>}
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="keepSignedIn"
              checked={keepSignedIn}
              onCheckedChange={(checked) => setKeepSignedIn(checked as boolean)}
              className="data-[state=checked]:bg-yellow-400 data-[state=checked]:border-yellow-400"
            />
            <label htmlFor="keepSignedIn" className="text-sm text-gray-600 cursor-pointer">
              Keep me signed in
            </label>
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <Button type="submit" disabled={isLoading} variant="yellow" className="w-full h-12">
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-[#82A0BFCC]" />
          <span className="px-4 text-sm text-(--color-gray-table)">or sign in with</span>
          <div className="flex-1 h-px bg-[#82A0BFCC]" />
        </div>
        <Button type="button" onClick={handleGoogleLogin} disabled={isLoading} variant="gray" className="w-full h-12 rounded-full border-gray-300">
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </Button>
        <div className="mt-8 text-center">
          <Link href="/auth/signup" className="text-(--color-primary-yellow-dark) hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
