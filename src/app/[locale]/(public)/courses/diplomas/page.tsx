import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { CourseCard } from "@/components/marketing/course-card";
import { CourseTabs } from "@/components/marketing/course-tabs";
import { SectionHeading } from "@/components/marketing/section-heading";
import { defaultLocale, isLocale } from "@/i18n-config";
import { diplomaCourses } from "@/lib/public-content";

type LocaleParams = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = await getTranslations({ locale, namespace: "phase1.meta.courseDiplomas" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function DiplomasPage({ params }: LocaleParams) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = await getTranslations({ locale, namespace: "phase1.courseDiplomas" });

  return (
    <div className="bg-white">
      <section className="border-b bg-gradient-to-br from-white via-amber-50 to-teal-50">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <SectionHeading eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
          <div className="mt-8">
            <CourseTabs locale={locale} current="/courses/diplomas" />
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-4 md:grid-cols-2">
          {diplomaCourses.map((course) => (
            <CourseCard key={`${course.provider}-${course.title}`} course={course} />
          ))}
        </div>
      </section>
    </div>
  );
}
