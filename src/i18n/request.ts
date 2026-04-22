import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = cookieStore.get("truck-flow-locale")?.value || "en";

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
      messages: (await import(`../../messages/en.json`)).default,
      timeZone: "Europe/Athens",
    };
  }
});
