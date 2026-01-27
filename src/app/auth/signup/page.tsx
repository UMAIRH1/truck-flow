"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { validateSignUpForm } from "../validations";
import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";

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
  
  /* ORIGINAL SIGNUP CODE - COMMENTED OUT
  const router = useRouter();
  const { signup, loginWithGoogle, selectedRole, isAuthenticated } = useAuth();
  const t = useTranslations("auth");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [justSignedUp, setJustSignedUp] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ name: "", email: "", password: "" });

  const nameRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);

  // Redirect if already authenticated (but avoid redirecting away while performing signup flow)
  React.useEffect(() => {
    if (isAuthenticated) {
      if (justSignedUp) {
        // Signed up just now; let the signup flow handle navigation to the success page
        setJustSignedUp(false);
        return;
      }
      router.push("/");
    }
  }, [isAuthenticated, router, justSignedUp]);

  // Redirect to splash if no role selected
  React.useEffect(() => {
    if (!selectedRole) {
      router.push("/auth/splash");
    }
  }, [selectedRole, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({ name: "", email: "", password: "" });

    if (!agreeTerms) {
      setError("Please agree to the terms of service");
      return;
    }

    const { nameError, emailError, passwordError } = validateSignUpForm(name, email, password);
    if (nameError || emailError || passwordError) {
      setFieldErrors({ name: nameError || "", email: emailError || "", password: passwordError || "" });
      // focus first invalid field
      setTimeout(() => {
        if (nameError) nameRef.current?.focus();
        else if (emailError) emailRef.current?.focus();
        else if (passwordError) passwordRef.current?.focus();
      });
      return;
    }

    setIsLoading(true);
    setJustSignedUp(true);

    try {
      await signup(name, email, password);
      router.push("/auth/success");
    } catch {
      setError("Registration failed. Please try again.");
      setJustSignedUp(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    setJustSignedUp(true);
    try {
      await loginWithGoogle();
      router.push("/auth/success");
    } catch {
      setError("Google sign up failed");
      setJustSignedUp(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col  px-4 py-4 max-w-md mx-auto">
      <div className="h-12" />
      <div className="flex-1 px-6 py-8">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">{t("createAccount")}</h1>
        <p className="text-center text-yellow-500 mb-8">{t("welcomeBack")}</p>

        <form noValidate onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-gray-600 mb-2">{t("name")}</label>
            <Input ref={nameRef} type="text" placeholder="Ab Mahmud" value={name} onChange={(e) => setName(e.target.value)} className="h-12 bg-gray-50 border-gray-200 rounded-lg" required />
            {fieldErrors.name && <p className="text-red-500 text-sm mt-1">{fieldErrors.name}</p>}
          </div>
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
            {fieldErrors.email && <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">{t("password")}</label>
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

          {/* Terms Agreement */}
          <div className="flex items-start gap-2">
            <Checkbox
              id="agreeTerms"
              checked={agreeTerms}
              onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
              className="mt-0.5 data-[state=checked]:bg-yellow-400 data-[state=checked]:border-yellow-400"
            />
            <label htmlFor="agreeTerms" className="text-sm text-gray-600 cursor-pointer">
              {t("agreeToTerms")}{" "}
              <Link href="/terms" className="text-yellow-500 hover:underline">
                {t("termsOfService")}
              </Link>
            </label>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          {/* Sign Up Button */}
          <Button type="submit" disabled={isLoading} className="w-full h-12 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-full">
            {isLoading ? t("signingUp") : t("signUp")}
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="px-4 text-sm text-gray-400">{t("orSignInWith")}</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Google Sign Up */}
        <Button type="button" onClick={handleGoogleSignUp} disabled={isLoading} variant="outline" className="w-full h-12 rounded-full border-gray-300 bg-gray-100">
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </Button>

        {/* Sign In Link */}
        <div className="mt-8 text-center">
          <Link href="/auth/signin" className="text-yellow-500 hover:underline">
            {t("alreadyHaveAccount")} {t("signIn")}
          </Link>
        </div>
      </div>
    </div>
  );
  */
}
