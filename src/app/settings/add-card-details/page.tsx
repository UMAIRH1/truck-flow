"use client";

import React, { useState } from "react";
import { Header, MobileLayout } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { validateCardDetails, CardDetailsErrors } from "@/app/settings/_components/validations";
import { useTranslations } from "next-intl";

interface ContentProps {
  name: string;
  setName: (value: string) => void;
  number: string;
  setNumber: (value: string) => void;
  expiry: string;
  setExpiry: (value: string) => void;
  cvv: string;
  setCvv: (value: string) => void;
  zip: string;
  setZip: (value: string) => void;
  errors: CardDetailsErrors;
  setErrors: React.Dispatch<React.SetStateAction<CardDetailsErrors>>;
  onSubmit: () => void;
  t: ReturnType<typeof useTranslations<"cardDetails">>;
}

const Content = ({ name, setName, number, setNumber, expiry, setExpiry, cvv, setCvv, zip, setZip, errors, setErrors, onSubmit, t }: ContentProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
    <div>
      <div className="bg-(--color-yellow-light) rounded-xl p-4 md:p-6 text-black shadow-lg">
        <div className="flex justify-between items-start">
          <div className="text-base font-medium">Mastercard</div>
          <div className="text-base font-medium">TruckFlow</div>
        </div>
        <div className="mt-6 text-base font-medium tracking-widest">{number ? number.replace(/\d(?=\d{4})/g, "*") : "1234 **** **** ****"}</div>
        <div className="mt-6 flex justify-between text-sm">
          <div>
            <div className="text-[10px] font-normal opacity-80">{t("cardHolder")}</div>
            <div className="font-medium text-[10px]">{name || t("yourName")}</div>
          </div>
          <div>
            <div className="text-[10px] font-normal opacity-80">{t("expired")}</div>
            <div className="font-medium text-[10px]">{expiry || "MM/YY"}</div>
          </div>
        </div>
      </div>
    </div>

    <div>
      <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
        <div className="space-y-4">
          <div>
            <label className="block text-base font-bold text-black mb-1">{t("nameOnCard")}</label>
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              placeholder={t("yourName")}
              className="w-full px-4 py-6! border border-gray-200! rounded-md!"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-base font-bold text-black mb-1">{t("cardNumber")}</label>
            <Input
              value={number}
              onChange={(e) => {
                setNumber(e.target.value);
                if (errors.number) setErrors((prev) => ({ ...prev, number: undefined }));
              }}
              placeholder="xxxx xxxx xxxx xxxx"
              className="w-full px-4 py-6! border border-gray-200! rounded-md!"
            />
            {errors.number && <p className="text-red-500 text-sm mt-1">{errors.number}</p>}
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-base font-bold text-black mb-1">{t("expiryDate")}</label>
              <Input
                value={expiry}
                onChange={(e) => {
                  setExpiry(e.target.value);
                  if (errors.expiry) setErrors((prev) => ({ ...prev, expiry: undefined }));
                }}
                placeholder="MM/YY"
                className="w-full px-4 py-6! border border-gray-200! rounded-md!"
              />
              {errors.expiry && <p className="text-red-500 text-sm mt-1">{errors.expiry}</p>}
            </div>
            <div>
              <label className="block text-base font-bold text-black mb-1">{t("securityCode")}</label>
              <Input
                value={cvv}
                onChange={(e) => {
                  setCvv(e.target.value);
                  if (errors.cvv) setErrors((prev) => ({ ...prev, cvv: undefined }));
                }}
                placeholder="CVV"
                className="w-full px-4 py-6! border border-gray-200! rounded-md!"
              />
              {errors.cvv && <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>}
            </div>
          </div>

          <div>
            <label className="block text-base font-bold text-black mb-1">{t("zipPostalCode")}</label>
            <Input
              value={zip}
              onChange={(e) => {
                setZip(e.target.value);
                if (errors.zip) setErrors((prev) => ({ ...prev, zip: undefined }));
              }}
              placeholder="ZIP"
              className="w-full px-4 py-6! border border-gray-200! rounded-md!"
            />
            {errors.zip && <p className="text-red-500 text-sm mt-1">{errors.zip}</p>}
          </div>

          <div className="pt-4">
            <Button onClick={onSubmit} className="w-full rounded-md text-base font-medium bg-black h-11 text-white">
              {t("addYourCard")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function AddCardDetailsPage() {
  const t = useTranslations("cardDetails");
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [zip, setZip] = useState("");
  const [errors, setErrors] = useState<CardDetailsErrors>({});

  function handleAddCard() {
    const newErrors = validateCardDetails(name, number, expiry, cvv, zip);
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      toast.success(t("cardAddedSuccess"));
    }
  }

  return (
    <>
      {/* Mobile */}
      <div className="block md:hidden">
        <MobileLayout showBottomNav={true} showFAB={true}>
          <Header title={t("title")} showBack />
          <div className=" max-w-md mx-auto  space-y-6 bg-(--color-yellow-light)">
            <div className="bg-white px-4 py-6 rounded-t-2xl">
              <Content
                name={name}
                setName={setName}
                number={number}
                setNumber={setNumber}
                expiry={expiry}
                setExpiry={setExpiry}
                cvv={cvv}
                setCvv={setCvv}
                zip={zip}
                setZip={setZip}
                errors={errors}
                setErrors={setErrors}
                onSubmit={handleAddCard}
                t={t}
              />
            </div>
          </div>
        </MobileLayout>
      </div>

      {/* Desktop */}
      <div className="hidden md:block min-h-screen bg-gray-50">
        <Header title={t("title")} showBack />
        <div className="max-w-7xl mx-auto py-12 px-6">
          <Content
            name={name}
            setName={setName}
            number={number}
            setNumber={setNumber}
            expiry={expiry}
            setExpiry={setExpiry}
            cvv={cvv}
            setCvv={setCvv}
            zip={zip}
            setZip={setZip}
            errors={errors}
            setErrors={setErrors}
            onSubmit={handleAddCard}
            t={t}
          />
        </div>
      </div>
    </>
  );
}
