"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { Locale, locales, defaultLocale, localeNames } from "@/i18n/config";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  locales: readonly Locale[];
  localeNames: Record<Locale, string>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LOCALE_STORAGE_KEY = "truck-flow-locale";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, updateProfile } = useAuth();
  const isInitialSync = useRef(true);

  const [locale, setLocaleState] = useState<Locale>(() => {
    // Initialize from localStorage immediately
    if (typeof window !== 'undefined') {
      const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
      return savedLocale && locales.includes(savedLocale) ? savedLocale : defaultLocale;
    }
    return defaultLocale;
  });

  // Sync with user's preferred language from DB on login/init
  useEffect(() => {
    if (isAuthenticated && user?.preferredLanguage && locales.includes(user.preferredLanguage as Locale)) {
      const dbLocale = user.preferredLanguage as Locale;
      if (dbLocale !== locale) {
        console.log(`[LanguageContext] Syncing locale from DB: ${dbLocale}`);
        setLocaleState(dbLocale);
        localStorage.setItem(LOCALE_STORAGE_KEY, dbLocale);
        window.dispatchEvent(new CustomEvent('localeChange', { detail: dbLocale }));
      }
    }
  }, [isAuthenticated, user?.preferredLanguage]);

  const setLocale = useCallback(async (newLocale: Locale) => {
    if (locales.includes(newLocale)) {
      setLocaleState(newLocale);
      localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
      
      // Dispatch custom event to notify TranslationProvider
      window.dispatchEvent(new CustomEvent('localeChange', { detail: newLocale }));

      // Persist to backend if authenticated
      if (isAuthenticated) {
        try {
          console.log(`[LanguageContext] Persisting new locale to DB: ${newLocale}`);
          await updateProfile({ preferredLanguage: newLocale });
        } catch (error) {
          console.error("Failed to persist language preference:", error);
        }
      }
    }
  }, [isAuthenticated]);

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
