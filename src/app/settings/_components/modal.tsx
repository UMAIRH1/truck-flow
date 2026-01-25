"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Landmark, X, LoaderCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children?: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const router = useRouter();
  const t = useTranslations("settings");
  const [isLoadingNav, setIsLoadingNav] = useState(false);

  if (!isOpen) return null;

  const handleNavigate = async (path: string) => {
    setIsLoadingNav(true);
    try {
      await router.push(path);
    } catch (err) {
      console.error(err);
      setIsLoadingNav(false);
    }
  };

  const paymentContent = (
    <div className="space-y-3">
      <div className="flex items-center justify-between p-3 bg-(--color-yellow-light) rounded-lg">
        <div className="flex items-center gap-3">
          <Landmark className="h-5 w-5 text-(--color-gray-text)" />
          <div>
            <p className="font-bold text-[13px] text-(--color-light-black-border)">{t("bankAccount")}</p>
            <p className="text-xs font-normal opacity-80 text-(--color-gray-text)">{t("linkYourBank")}</p>
          </div>
        </div>
        <button onClick={() => handleNavigate("/settings/add-bank-account")} className="w-28">
          <Badge className="px-4 py-1.5  w-full bg-(--color-blue-border) rounded-md">{t("addAccount")}</Badge>
        </button>
      </div>
      <div className="flex items-center justify-between p-3 bg-(--color-yellow-light) rounded-lg">
        <div className="flex items-center gap-3">
          <CreditCard className="h-5 w-5 text-(--color-gray-text)" />
          <div>
            <p className="font-bold text-[13px] text-(--color-light-black-border)">{t("creditDebitCard")}</p>
            <p className="text-xs  font-normal text-(--color-gray-text)">{t("addCardDetails")}</p>
          </div>
        </div>
        <button onClick={() => handleNavigate("/settings/add-card-details")} className="w-28">
          <Badge className="px-4 py-1.5 w-full bg-(--color-blue-border) rounded-md">{t("addCard")}</Badge>
        </button>
      </div>
      <p className="text-center text-base font-normal text-(--color-extra-light-gray) mt-4">{t("transactionsSecure")}</p>
    </div>
  );

  return (
    <>
      {isLoadingNav && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40">
          <div className="inline-flex items-center justify-center bg-white p-4 rounded-full shadow">
            <LoaderCircle className="h-8 w-8 animate-spin text-black" aria-hidden />
          </div>
        </div>
      )}

      <div className="md:hidden fixed inset-0 z-[99999] flex items-end justify-center">
        <div className="absolute inset-0 bg-black/80 bg-opacity-40" onClick={onClose} />

        <div className="relative w-full max-w-md bg-white rounded-t-2xl p-4 shadow-lg transform transition-transform duration-300">
          <button aria-label="Close" onClick={onClose} className="absolute top-4 right-4 inline-flex items-center justify-center rounded-md p-2 hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-600" />
          </button>
          <div className="w-12 h-1.5 bg-white rounded-full mx-auto mb-3" />
          {title && <h2 className="text-lg text-(--color-light-black) font-bold mb-4 text-center">{title}</h2>}
          <div>{title === t("paymentMethods") ? paymentContent : children}</div>
        </div>
      </div>
      <div className="hidden md:flex fixed inset-0 z-[99999] items-center justify-center">
        <div className="absolute inset-0 bg-black/80 bg-opacity-40" onClick={onClose} />
        <div className="relative bg-white rounded-2xl p-6 shadow-lg w-3/5 max-w-2xl">
          <button aria-label="Close" onClick={onClose} className="absolute top-4 right-4 inline-flex items-center justify-center rounded-md p-2 hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-600" />
          </button>
          {title && <h2 className="text-2xl font-bold mb-4 text-(--color-light-black)">{title}</h2>}
          <div>{title === t("paymentMethods") ? paymentContent : children}</div>
        </div>
      </div>
    </>
  );
}

export default Modal;
