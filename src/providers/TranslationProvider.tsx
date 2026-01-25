"use client";

import React, { useState, useEffect } from "react";
import { NextIntlClientProvider, AbstractIntlMessages } from "next-intl";
import { Locale, defaultLocale, locales } from "@/i18n/config";

const LOCALE_STORAGE_KEY = "truck-flow-locale";

async function loadMessages(locale: Locale): Promise<AbstractIntlMessages> {
  try {
    return (await import(`../../messages/${locale}.json`)).default;
  } catch {
    return (await import(`../../messages/en.json`)).default;
  }
}

interface TranslationProviderProps {
  children: React.ReactNode;
}

export function TranslationProvider({ children }: TranslationProviderProps) {
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const [messages, setMessages] = useState<AbstractIntlMessages | null>(null);

  useEffect(() => {
    // Get locale from localStorage
    const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
    const currentLocale = savedLocale && locales.includes(savedLocale) ? savedLocale : defaultLocale;

    setLocale(currentLocale);

    // Load messages
    loadMessages(currentLocale).then(setMessages);
  }, []);

  if (!messages) {
    return (
      <div className="min-h-screen bg-yellow-400 flex items-center justify-center">
        <div className="text-black font-bold text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
