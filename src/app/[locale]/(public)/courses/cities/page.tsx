import type { Metadata } from "next";
import { Building2, MapPin } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { CourseTabs } from "@/components/marketing/course-tabs";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { defaultLocale, isLocale } from "@/i18n-config";
import { courseCities } from "@/lib/public-content";

type LocaleParams = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = await getTranslations({ locale, namespace: "phase1.meta.courseCities" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function CourseCitiesPage({ params }: LocaleParams) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = await getTranslations({ locale, namespace: "phase1.courseCities" });

  return (
    <div className="bg-white">
      <section className="border-b bg-gradient-to-br from-white via-teal-50 to-amber-50">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <SectionHeading eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
          <div className="mt-8">
            <CourseTabs locale={locale} current="/courses/cities" />
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {courseCities.map((city) => (
            <Card key={city.name} className="bg-white">
              <CardHeader>
                <div className="flex size-11 items-center justify-center rounded-md bg-teal-100 text-teal-800">
                  <MapPin className="size-5" />
                </div>
                <CardTitle>{city.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className="rounded-md">
                  {city.district}
                </Badge>
                <p className="mt-4 text-sm leading-6 text-neutral-600">{city.focus}</p>
                <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-neutral-950">
                  <Building2 className="size-4 text-amber-700" />
                  {city.courseCount} {t("courseCount")}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
