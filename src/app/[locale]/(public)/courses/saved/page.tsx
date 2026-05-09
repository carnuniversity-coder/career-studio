import type { Metadata } from "next";
import Link from "next/link";
import { Bookmark, LockKeyhole } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { CourseTabs } from "@/components/marketing/course-tabs";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { defaultLocale, isLocale } from "@/i18n-config";

type LocaleParams = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = await getTranslations({ locale, namespace: "phase1.meta.courseSaved" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function SavedCoursesPage({ params }: LocaleParams) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = await getTranslations({ locale, namespace: "phase1.courseSaved" });

  return (
    <div className="bg-white">
      <section className="border-b bg-gradient-to-br from-white via-amber-50 to-teal-50">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <SectionHeading eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
          <div className="mt-8">
            <CourseTabs locale={locale} current="/courses/saved" />
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-14">
        <Card className="mx-auto max-w-2xl bg-white text-center">
          <CardContent className="p-10">
            <div className="mx-auto flex size-14 items-center justify-center rounded-md bg-teal-100 text-teal-800">
              <Bookmark className="size-7" />
            </div>
            <h2 className="mt-5 text-2xl font-semibold text-neutral-950">{t("emptyTitle")}</h2>
            <p className="mt-3 text-sm leading-6 text-neutral-600">{t("emptyDescription")}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild className="bg-teal-700 text-white hover:bg-teal-800">
                <Link href={`/${locale}/auth/sign-in`}>
                  <LockKeyhole className="size-4" />
                  {t("signIn")}
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/${locale}/courses`}>{t("browseCourses")}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
