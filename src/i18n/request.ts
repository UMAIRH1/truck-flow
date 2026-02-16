import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => {
  // For client-side i18n without routing, we'll get locale from cookie/localStorage
  // Default to 'en' if not set
  const locale = "en";

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    timeZone: "Europe/Athens", // Set default timezone for Greece
  };
});
