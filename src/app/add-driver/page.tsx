"use client";

import React, { useState } from "react";
import { Header, MobileLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, User, Mail, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api";

export default function AddDriverPage() {
  const router = useRouter();
  const t = useTranslations("addDriver");
  const tCommon = useTranslations("common");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    preferredLanguage: "en",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const validateForm = () => {
    const errors = {
      name: "",
      email: "",
      phone: "",
    };
    let isValid = true;
    if (!formData.name.trim()) {
      errors.name = t("nameRequired");
      isValid = false;
    } else if (formData.name.trim().length < 2) {
      errors.name = t("nameTooShort");
      isValid = false;
    }
    if (!formData.email.trim()) {
      errors.email = t("emailRequired");
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = t("emailInvalid");
      isValid = false;
    }

    if (!formData.phone.trim()) {
      errors.phone = t("phoneRequired");
      isValid = false;
    } else if (!/^\+?[\d\s\-()]+$/.test(formData.phone)) {
      errors.phone = t("phoneInvalid");
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.createDriver(formData);
      if (response.success) {
        // Check if email was sent
        if (response.emailSent) {
          setSuccess(t("driverCreatedSuccess") || "Driver created successfully! Invitation email sent.");
        } else {
          setSuccess("Driver created successfully! However, the invitation email could not be sent. Please contact the driver manually.");
          console.error("Email error:", response.emailError);
        }
        
        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          preferredLanguage: "en",
        });
        
        // Redirect after 3 seconds
        setTimeout(() => {
          router.push("/drivers");
        }, 3000);
      }
    } catch (err: any) {
      console.error("Create driver error:", err);
      setError(err.message || t("createDriverError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field as keyof typeof fieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <MobileLayout showFAB={true} showBottomNav={true}>
      <Header title={t("title")} showBack />
      <div className="max-w-7xl px-6 py-6 mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-red-500">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm">{success}</p>
            </div>
          )}

          <Card className="md:p-5 p-4 gap-2">
            <CardHeader className="px-0">
              <CardTitle className="text-lg">{t("driverInformation")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-0">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {t("name")}
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder={t("namePlaceholder")}
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  disabled={isSubmitting}
                  aria-invalid={!!fieldErrors.name}
                />
                {fieldErrors.name && <p className="text-sm text-red-500">{fieldErrors.name}</p>}
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {t("email")}
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  disabled={isSubmitting}
                  aria-invalid={!!fieldErrors.email}
                />
                {fieldErrors.email && <p className="text-sm text-red-500">{fieldErrors.email}</p>}
              </div>
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {t("phone")}
                </label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder={t("phonePlaceholder")}
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  disabled={isSubmitting}
                  aria-invalid={!!fieldErrors.phone}
                />
                {fieldErrors.phone && <p className="text-sm text-red-500">{fieldErrors.phone}</p>}
              </div>

              {/* Info Message */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> The driver will receive an email with a link to set their password.
                </p>
              </div>

              <Button type="submit" variant="yellow" disabled={isSubmitting} className="w-full h-12 rounded-lg text-base font-semibold">
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {t("creatingDriver")}
                  </>
                ) : (
                  t("createDriver")
                )}
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </MobileLayout>
  );
}
