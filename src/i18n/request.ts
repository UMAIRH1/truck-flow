import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => {
  // Locale for static generation
  const locale = "en";

  try {
    const messages = (await import(`../../messages/${locale}.json`)).default;
    return {
      locale,
      messages,
      timeZone: "Europe/Athens",
    };
  } catch (error) {
    console.error(`Failed to load messages for locale ${locale}:`, error);
    return {
      locale,
      messages: {},
      timeZone: "Europe/Athens",
    };
  }
});
