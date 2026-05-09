import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Download, FileText, LockKeyhole, MessageSquareText } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { SectionHeading } from "@/components/marketing/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { defaultLocale, isLocale } from "@/i18n-config";
import { resourceCards, resourceCollections } from "@/lib/public-content";

type LocaleParams = {
  params: Promise<{ locale: string }>;
};

const resourceIcons = [FileText, Download, MessageSquareText, LockKeyhole] as const;

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = await getTranslations({ locale, namespace: "phase1.meta.resources" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function ResourcesPage({ params }: LocaleParams) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = await getTranslations({ locale, namespace: "phase1.resources" });

  return (
    <div className="bg-white">
      <section className="border-b bg-gradient-to-br from-amber-50 via-white to-teal-50">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <SectionHeading eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {resourceCards.map((resource, index) => {
            const Icon = resourceIcons[index];

            return (
              <Card key={resource.title} className={resource.disabled ? "bg-neutral-50 opacity-80" : "bg-white"}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex size-11 items-center justify-center rounded-md bg-amber-100 text-amber-900">
                      <Icon className="size-5" />
                    </div>
                    <Badge variant={resource.disabled ? "outline" : "secondary"} className="rounded-md">
                      {resource.badge}
                    </Badge>
                  </div>
                  <CardTitle>{resource.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 text-neutral-600">{resource.description}</p>
                  <p className="mt-4 text-sm font-semibold text-neutral-950">{resource.count}</p>
                </CardContent>
                <CardFooter className="bg-neutral-50">
                  {resource.disabled ? (
                    <Button disabled variant="secondary" className="w-full">
                      {t("comingSoon")}
                    </Button>
                  ) : (
                    <Button asChild variant="outline" className="w-full">
                      <Link href={`/${locale}${resource.href ?? "/resources"}`}>
                        {t("browse")}
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="border-y bg-neutral-50">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <SectionHeading eyebrow={t("collectionsEyebrow")} title={t("collectionsTitle")} />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {resourceCollections.map((collection) => (
              <Card key={collection.title} className="bg-white">
                <CardHeader>
                  <BookOpen className="size-6 text-teal-700" />
                  <CardTitle>{collection.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-6 text-neutral-600">{collection.description}</CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="rounded-xl border bg-teal-800 px-6 py-10 text-white md:px-10">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-100">{t("ctaEyebrow")}</p>
            <h2 className="mt-3 text-3xl font-semibold">{t("ctaTitle")}</h2>
            <p className="mt-3 text-teal-50">{t("ctaDescription")}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
