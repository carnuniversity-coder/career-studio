import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { AtsCheckerClient } from "@/components/feature/ats/ats-checker-client";
import { defaultLocale, isLocale } from "@/i18n-config";

type AtsPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: AtsPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = await getTranslations({ locale, namespace: "phase3.meta.ats" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function AtsPage({ params }: AtsPageProps) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = await getTranslations({ locale, namespace: "phase3.ats" });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">{t("title")}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">{t("subtitle")}</p>
      </div>
      <AtsCheckerClient
        labels={{
          uploadTitle: t("uploadTitle"),
          uploadBody: t("uploadBody"),
          pasteLabel: t("pasteLabel"),
          jdLabel: t("jdLabel"),
          analyze: t("analyze"),
          scoreTitle: t("scoreTitle"),
          issues: t("issues"),
          suggestions: t("suggestions"),
          jdMatch: t("jdMatch"),
        }}
      />
    </div>
  );
}
