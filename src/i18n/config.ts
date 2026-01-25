export const locales = ["en", "el"] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  en: "English",
  el: "Ελληνικά",
};

export const defaultLocale: Locale = "en";
