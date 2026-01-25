"use client";
import { Header, MobileLayout } from "@/components/layout";
import { useTranslations } from "next-intl";

export default function SupportPage() {
  const t = useTranslations("support");
  const tHeader = useTranslations("header");

  return (
    <MobileLayout showFAB={false}>
      <Header title={tHeader("support")} showBack />
      <div className=" max-w-7xl mx-auto sm:mt-7 max-sm:bg-(--color-yellow-light)">
        <section className="bg-white px-4 py-6 max-sm:rounded-t-2xl sm:rounded md:shadow-md md:border border-gray-200">
          <h3 className="text-lg font-semibold mb-2">{t("needHelp")}</h3>
          <p className="text-sm text-gray-700 mb-4">
            {t("supportText")}
            <a href="mailto:support@truckflow.example" className="underline ml-1">
              support@truckflow.example
            </a>
            .
          </p>
          <p className="text-sm text-gray-700 mb-2">
            {t("supportHours")} <strong>{t("weekdays")}</strong>.
          </p>
          <p className="text-sm text-gray-700">
            {t("urgentIssues")}{" "}
            <a href="tel:+18001234567" className="underline">
              +1 (800) 123-4567
            </a>
            . {t("responseTime")}
          </p>
        </section>
      </div>
    </MobileLayout>
  );
}
