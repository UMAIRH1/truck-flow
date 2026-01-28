"use client";

import React, { useState, useEffect } from "react";
import { NextIntlClientProvider, AbstractIntlMessages } from "next-intl";
import { Locale, defaultLocale, locales } from "@/i18n/config";

const LOCALE_STORAGE_KEY = "truck-flow-locale";

// Import default messages at module level to avoid async loading on first render
import enMessages from "../../messages/en.json";
import elMessages from "../../messages/el.json";

const messageCache: Record<Locale, AbstractIntlMessages> = {
  en: enMessages,
  el: elMessages,
};

function getMessages(locale: Locale): AbstractIntlMessages {
  return messageCache[locale] || messageCache.en;
}

function getInitialLocale(): Locale {
  if (typeof window !== 'undefined') {
    const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
    return savedLocale && locales.includes(savedLocale) ? savedLocale : defaultLocale;
  }
  return defaultLocale;
}

interface TranslationProviderProps {
  children: React.ReactNode;
}

export function TranslationProvider({ children }: TranslationProviderProps) {
  const [locale, setLocale] = useState<Locale>(getInitialLocale);
  const [messages, setMessages] = useState<AbstractIntlMessages>(() => getMessages(locale));

  useEffect(() => {
    // Listen for locale changes from LanguageContext
    const handleLocaleChange = (event: CustomEvent<Locale>) => {
      const newLocale = event.detail;
      setLocale(newLocale);
      setMessages(getMessages(newLocale));
    };

    window.addEventListener('localeChange', handleLocaleChange as EventListener);
    return () => {
      window.removeEventListener('localeChange', handleLocaleChange as EventListener);
    };
  }, []);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
