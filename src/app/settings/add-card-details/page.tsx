"use client";

import React, { useState } from "react";
import { Header, MobileLayout } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { validateCardDetails, CardDetailsErrors } from "@/app/settings/_components/validations";

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
}

const Content = ({ name, setName, number, setNumber, expiry, setExpiry, cvv, setCvv, zip, setZip, errors, setErrors, onSubmit }: ContentProps) => (
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
            <div className="text-[10px] font-normal opacity-80">CARD HOLDER</div>
            <div className="font-medium text-[10px]">{name || "Your Name"}</div>
          </div>
          <div>
            <div className="text-[10px] font-normal opacity-80">EXPIRED</div>
            <div className="font-medium text-[10px]">{expiry || "MM/YY"}</div>
          </div>
        </div>
      </div>
    </div>

    <div>
      <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
        <div className="space-y-4">
          <div>
            <label className="block text-base font-bold text-black mb-1">Name On Card</label>
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              placeholder="Your name"
              className="w-full px-4 py-6! border border-gray-200! rounded-md!"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-base font-bold text-black mb-1">Card Number</label>
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
              <label className="block text-base font-bold text-black mb-1">Expiry Date</label>
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
              <label className="block text-base font-bold text-black mb-1">Security Code</label>
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
            <label className="block text-base font-bold text-black mb-1">ZIP/ Postal Code</label>
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
              Add Your Card
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function AddCardDetailsPage() {
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
      toast.success("Card added successfully!");
    }
  }

  return (
    <>
      {/* Mobile */}
      <div className="block md:hidden">
        <MobileLayout showBottomNav={true} showFAB={true}>
          <Header title="Add Card" showBack />
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
              />
            </div>
          </div>
        </MobileLayout>
      </div>

      {/* Desktop */}
      <div className="hidden md:block min-h-screen bg-gray-50">
        <Header title="Add Card" showBack />
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
          />
        </div>
      </div>
    </>
  );
}
