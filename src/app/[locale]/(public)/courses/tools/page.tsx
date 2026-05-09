import type { Metadata } from "next";
import { BadgeCheck, WandSparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { CourseTabs } from "@/components/marketing/course-tabs";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { defaultLocale, isLocale } from "@/i18n-config";
import { courseTools } from "@/lib/public-content";

type LocaleParams = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = await getTranslations({ locale, namespace: "phase1.meta.courseTools" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function CourseToolsPage({ params }: LocaleParams) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = await getTranslations({ locale, namespace: "phase1.courseTools" });

  return (
    <div className="bg-white">
      <section className="border-b bg-gradient-to-br from-teal-50 via-white to-rose-50">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <SectionHeading eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
          <div className="mt-8">
            <CourseTabs locale={locale} current="/courses/tools" />
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courseTools.map((tool) => (
            <Card key={tool.name} className="bg-white">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex size-11 items-center justify-center rounded-md bg-rose-100 text-rose-800">
                    <WandSparkles className="size-5" />
                  </div>
                  {tool.verified ? (
                    <Badge variant="outline" className="rounded-md border-teal-200 text-teal-800">
                      <BadgeCheck className="size-3" />
                      {t("verified")}
                    </Badge>
                  ) : null}
                </div>
                <CardTitle>{tool.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-neutral-600">{tool.tagline}</p>
                <div className="mt-5 flex items-center justify-between gap-4 text-sm">
                  <span className="text-neutral-500">{tool.industry}</span>
                  <span className="font-semibold text-neutral-950">{tool.pricing}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
