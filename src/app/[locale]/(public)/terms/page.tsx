import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { SectionHeading } from "@/components/marketing/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { defaultLocale, isLocale } from "@/i18n-config";

type LegalPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: LegalPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = await getTranslations({ locale, namespace: "phase2.meta.terms" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function TermsPage({ params }: LegalPageProps) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = await getTranslations({ locale, namespace: "phase2.legal" });

  return (
    <div className="bg-white">
      <section className="border-b bg-gradient-to-br from-white via-teal-50 to-amber-50">
        <div className="mx-auto max-w-4xl px-4 py-16">
          <SectionHeading eyebrow={t("eyebrow")} title={t("termsTitle")} description={t("termsDescription")} />
        </div>
      </section>
      <section className="mx-auto max-w-4xl px-4 py-10">
        <Card className="bg-white">
          <CardContent className="space-y-6 p-6 text-sm leading-7 text-neutral-700">
            <p>{t("termsBodyOne")}</p>
            <p>{t("termsBodyTwo")}</p>
            <p>{t("termsBodyThree")}</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
