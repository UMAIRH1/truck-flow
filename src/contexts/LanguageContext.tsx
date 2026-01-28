"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Locale, locales, defaultLocale, localeNames } from "@/i18n/config";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  locales: readonly Locale[];
  localeNames: Record<Locale, string>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LOCALE_STORAGE_KEY = "truck-flow-locale";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    // Initialize from localStorage immediately
    if (typeof window !== 'undefined') {
      const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
      return savedLocale && locales.includes(savedLocale) ? savedLocale : defaultLocale;
    }
    return defaultLocale;
  });

  const setLocale = useCallback((newLocale: Locale) => {
    if (locales.includes(newLocale)) {
      setLocaleState(newLocale);
      localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
      // Dispatch custom event to notify TranslationProvider
      window.dispatchEvent(new CustomEvent('localeChange', { detail: newLocale }));
    }
  }, []);

  return (
    <LanguageContext.Provider
      value={{
        locale,
        setLocale,
        locales,
        localeNames,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
