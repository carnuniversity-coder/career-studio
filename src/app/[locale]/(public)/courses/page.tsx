import type { Metadata } from "next";
import { Search } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { CourseCard } from "@/components/marketing/course-card";
import { CourseTabs } from "@/components/marketing/course-tabs";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { defaultLocale, isLocale } from "@/i18n-config";
import { courses } from "@/lib/public-content";

type CoursePageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = await getTranslations({ locale, namespace: "phase1.meta.courses" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function CoursesPage({ params, searchParams }: CoursePageProps) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const query = await searchParams;
  const t = await getTranslations({ locale, namespace: "phase1.courses" });
  const q = firstParam(query.q).toLowerCase();
  const category = firstParam(query.category);
  const city = firstParam(query.city);
  const level = firstParam(query.level);
  const freeOnly = firstParam(query.free) === "on";
  const verifiedOnly = firstParam(query.verified) === "on";
  const installmentsOnly = firstParam(query.installments) === "on";

  const categories = Array.from(new Set(courses.map((course) => course.category))).sort();
  const cities = Array.from(new Set(courses.map((course) => course.city))).sort();
  const levels = Array.from(new Set(courses.map((course) => course.level))).sort();
  const filteredCourses = courses.filter((course) => {
    const haystack = `${course.title} ${course.provider} ${course.summary}`.toLowerCase();

    return (
      (!q || haystack.includes(q)) &&
      (!category || course.category === category) &&
      (!city || course.city === city) &&
      (!level || course.level === level) &&
      (!freeOnly || course.price === "Rs. 0") &&
      (!verifiedOnly || course.verified) &&
      (!installmentsOnly || course.installments)
    );
  });

  return (
    <div className="bg-white">
      <section className="border-b bg-gradient-to-br from-white via-teal-50 to-amber-50">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <SectionHeading eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
          <div className="mt-8">
            <CourseTabs locale={locale} current="/courses" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-3 sm:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-semibold text-neutral-950">{courses.length}</div>
              <div className="text-sm text-neutral-600">{t("statsCourses")}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-semibold text-neutral-950">{cities.length}</div>
              <div className="text-sm text-neutral-600">{t("statsCities")}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-semibold text-neutral-950">
                {courses.filter((course) => course.installments).length}
              </div>
              <div className="text-sm text-neutral-600">{t("statsInstallments")}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-semibold text-neutral-950">
                {courses.filter((course) => course.price === "Rs. 0").length}
              </div>
              <div className="text-sm text-neutral-600">{t("statsFree")}</div>
            </CardContent>
          </Card>
        </div>

        <form action={`/${locale}/courses`} className="mt-8 rounded-xl border bg-neutral-50 p-4">
          <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto]">
            <div>
              <Label htmlFor="q">{t("searchLabel")}</Label>
              <div className="relative mt-2">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
                <Input id="q" name="q" defaultValue={firstParam(query.q)} className="pl-9" />
              </div>
            </div>
            <div>
              <Label htmlFor="category">{t("categoryLabel")}</Label>
              <select
                id="category"
                name="category"
                defaultValue={category}
                className="mt-2 h-9 w-full rounded-md border bg-white px-3 text-sm"
              >
                <option value="">{t("allCategories")}</option>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="city">{t("cityLabel")}</Label>
              <select id="city" name="city" defaultValue={city} className="mt-2 h-9 w-full rounded-md border bg-white px-3 text-sm">
                <option value="">{t("allCities")}</option>
                {cities.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="level">{t("levelLabel")}</Label>
              <select id="level" name="level" defaultValue={level} className="mt-2 h-9 w-full rounded-md border bg-white px-3 text-sm">
                <option value="">{t("allLevels")}</option>
                {levels.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full bg-teal-700 text-white hover:bg-teal-800">
                {t("filter")}
              </Button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3 text-sm text-neutral-700">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="verified" defaultChecked={verifiedOnly} className="size-4 rounded border-neutral-300" />
              {t("verifiedOnly")}
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="installments"
                defaultChecked={installmentsOnly}
                className="size-4 rounded border-neutral-300"
              />
              {t("installmentsOnly")}
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="free" defaultChecked={freeOnly} className="size-4 rounded border-neutral-300" />
              {t("freeOnly")}
            </label>
          </div>
        </form>

        <div className="mt-8 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-neutral-950">{t("resultsTitle")}</h2>
          <Badge variant="outline" className="rounded-md">
            {filteredCourses.length} {t("resultsCount")}
          </Badge>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {filteredCourses.map((course) => (
            <CourseCard key={`${course.provider}-${course.title}`} course={course} />
          ))}
        </div>
      </section>
    </div>
  );
}
