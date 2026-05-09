import type { Metadata } from "next";
import Link from "next/link";
import { Palette } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { defaultLocale, isLocale } from "@/i18n-config";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createGcvResumeAction } from "@/server/actions/resumes/create-resume";

type GcvPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: GcvPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = await getTranslations({ locale, namespace: "phase3.meta.gcv" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function GcvPage({ params }: GcvPageProps) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = await getTranslations({ locale, namespace: "phase3.gcv" });
  const session = await auth();
  const action = createGcvResumeAction.bind(null, locale);
  const resumes = session?.user?.id
    ? await prisma.gCVResume.findMany({
        where: { userId: session.user.id },
        orderBy: { updatedAt: "desc" },
        take: 12,
      })
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">{t("title")}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">{t("subtitle")}</p>
      </div>
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>{t("createTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={action} className="grid gap-4 lg:grid-cols-[1fr_160px_160px_auto]">
            <Input name="title" placeholder={t("titlePlaceholder")} required />
            <select name="accent" className="h-9 rounded-md border bg-white px-3 text-sm">
              <option value="teal">Teal</option>
              <option value="amber">Amber</option>
              <option value="rose">Rose</option>
              <option value="neutral">Neutral</option>
            </select>
            <select name="density" className="h-9 rounded-md border bg-white px-3 text-sm">
              <option value="comfortable">Comfortable</option>
              <option value="compact">Compact</option>
              <option value="spacious">Spacious</option>
            </select>
            <input type="hidden" name="template" value="modern" />
            <Button type="submit" className="bg-teal-700 text-white hover:bg-teal-800">
              <Palette className="size-4" />
              {t("create")}
            </Button>
          </form>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {resumes.map((resume) => (
          <Card key={resume.id} className="bg-white">
            <CardHeader>
              <Palette className="size-6 text-teal-700" />
              <CardTitle>{resume.title}</CardTitle>
              <p className="text-sm text-neutral-600">{resume.updatedAt.toLocaleDateString("en-LK")}</p>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href={`/${locale}/gcv/${resume.id}`}>{t("openEditor")}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
