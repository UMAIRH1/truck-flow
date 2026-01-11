"use client";
import { Header, MobileLayout } from "@/components/layout";
export default function SupportPage() {
  return (
    <MobileLayout showFAB={false}>
      <Header title="Support" showBack />
      <div className="px-4 py-6 max-w-7xl mx-auto">
        <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-2">Need help?</h3>
          <p className="text-sm text-gray-700 mb-4">
            If you have any questions or need assistance with your account or the app, please reach out to our support team at
            <a href="mailto:support@truckflow.example" className="underline ml-1">
              support@truckflow.example
            </a>
            .
          </p>
          <p className="text-sm text-gray-700 mb-2">
            Support hours: <strong>Mon–Fri, 09:00–18:00 (local time)</strong>.
          </p>
          <p className="text-sm text-gray-700">
            For urgent issues, call{" "}
            <a href="tel:+18001234567" className="underline">
              +1 (800) 123-4567
            </a>
            . We aim to respond within one business day.
          </p>
        </section>
      </div>
    </MobileLayout>
  );
}
