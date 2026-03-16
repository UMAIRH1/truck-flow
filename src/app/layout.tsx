import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { LoadProvider } from "@/contexts/LoadContext";
import { RouteProvider } from "@/contexts/RouteContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { TranslationProvider } from "@/providers/TranslationProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Truck Flow - Logistics Management",
  description: "Mobile-first logistics management for managers and drivers",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/Logo.svg",
    apple: "/icons/Logo.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TruckFlow",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#FACC15",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${inter.variable} font-sans antialiased`}>
        <TranslationProvider>
          <LanguageProvider>
            <AuthProvider>
              <NotificationProvider>
                <LoadProvider>
                  <RouteProvider>{children}</RouteProvider>
                </LoadProvider>
              </NotificationProvider>
            </AuthProvider>
          </LanguageProvider>
        </TranslationProvider>
      </body>
    </html>
  );
}
