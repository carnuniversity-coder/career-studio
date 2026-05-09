import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, CheckCircle2, FileText, MapPin, Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { SectionHeading } from "@/components/marketing/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { defaultLocale, isLocale } from "@/i18n-config";
import { landingFeatures, landingStats, resumeTemplateTiers } from "@/lib/public-content";

type LocaleParams = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = await getTranslations({ locale, namespace: "phase1.meta.landing" });

  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      type: "website",
      title: t("title"),
      description: t("description"),
      url: "https://careerstudio.app/",
      images: ["/images/og-image.png"],
    },
  };
}

export default async function LandingPage({ params }: LocaleParams) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = await getTranslations({ locale, namespace: "phase1.landing" });

  return (
    <div className="bg-white">
      <section className="border-b bg-gradient-to-br from-teal-50 via-white to-amber-50">
        <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-10 px-4 py-12 lg:grid-cols-[1.02fr_0.98fr] lg:py-16">
          <div>
            <Badge variant="outline" className="h-8 rounded-md border-teal-200 bg-white px-3 text-teal-800">
              <MapPin className="size-3.5" />
              {t("kicker")}
            </Badge>
            <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-tight text-neutral-950 md:text-6xl">
              {t("headline")}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-neutral-600">{t("subheadline")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-teal-700 text-white hover:bg-teal-800">
                <Link href={`/${locale}/auth/sign-up`}>
                  {t("primaryCta")}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href={`/${locale}/ats`}>{t("secondaryCta")}</Link>
              </Button>
            </div>
            <div className="mt-5 flex flex-wrap gap-3 text-sm text-neutral-600">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="size-4 text-teal-700" />
                {t("trustOne")}
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="size-4 text-teal-700" />
                {t("trustTwo")}
              </span>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-3 shadow-xl">
            <div className="overflow-hidden rounded-lg border bg-neutral-950">
              <Image
                src="/images/ats-preview.jpg"
                alt={t("previewAlt")}
                width={920}
                height={620}
                priority
                className="h-auto w-full object-cover"
              />
            </div>
            <div className="grid gap-3 p-4 sm:grid-cols-3">
              {landingStats.map((stat) => (
                <div key={stat.label} className="rounded-lg border bg-teal-50/70 p-3">
                  <div className="text-xl font-semibold text-teal-900">{stat.value}</div>
                  <div className="mt-1 text-xs leading-5 text-teal-950/70">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <SectionHeading
          eyebrow={t("featuresEyebrow")}
          title={t("featuresTitle")}
          description={t("featuresDescription")}
          align="center"
        />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {landingFeatures.map((feature, index) => {
            const icons = [Sparkles, BadgeCheck, FileText] as const;
            const Icon = icons[index];

            return (
              <Card key={feature.title} className="border-neutral-200">
                <CardHeader>
                  <div className="flex size-10 items-center justify-center rounded-md bg-amber-100 text-amber-800">
                    <Icon className="size-5" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-6 text-neutral-600">{feature.description}</CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="border-y bg-neutral-50">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeading
            eyebrow={t("templatesEyebrow")}
            title={t("templatesTitle")}
            description={t("templatesDescription")}
          />
          <div className="grid gap-4 md:grid-cols-3">
            {resumeTemplateTiers.map((tier) => (
              <Card key={tier.name} className="bg-white">
                <CardHeader>
                  <Badge variant={tier.name === "Basic" ? "secondary" : "outline"} className="w-fit rounded-md">
                    {tier.price}
                  </Badge>
                  <CardTitle>{tier.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-6 text-neutral-600">{tier.description}</CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="rounded-xl border bg-teal-800 px-6 py-10 text-white md:px-10">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-teal-100">{t("ctaEyebrow")}</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">{t("ctaTitle")}</h2>
              <p className="mt-3 max-w-2xl text-teal-50">{t("ctaDescription")}</p>
            </div>
            <Button asChild size="lg" variant="secondary">
              <Link href={`/${locale}/auth/sign-up`}>
                {t("primaryCta")}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
