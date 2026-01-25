import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { LoadProvider } from "@/contexts/LoadContext";
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
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Truck Flow",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#facc15",
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
                <LoadProvider>{children}</LoadProvider>
              </NotificationProvider>
            </AuthProvider>
          </LanguageProvider>
        </TranslationProvider>
      </body>
    </html>
  );
}
