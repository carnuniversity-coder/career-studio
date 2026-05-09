import type { Metadata } from "next";
import Link from "next/link";
import { FileText, WandSparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { defaultLocale, isLocale } from "@/i18n-config";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateCoverLetterAction } from "@/server/actions/resumes/create-resume";

type CoverLetterPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: CoverLetterPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = await getTranslations({ locale, namespace: "phase3.meta.coverLetter" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function CoverLetterPage({ params }: CoverLetterPageProps) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = await getTranslations({ locale, namespace: "phase3.coverLetter" });
  const session = await auth();
  const action = generateCoverLetterAction.bind(null, locale);
  const letters = session?.user?.id
    ? await prisma.coverLetter.findMany({
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
          <CardTitle>{t("wizardTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={action} className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input name="jobTitle" placeholder={t("jobTitle")} required />
              <Input name="companyName" placeholder={t("companyName")} required />
            </div>
            <Textarea name="profileText" rows={5} placeholder={t("profileText")} required />
            <Textarea name="jobDescription" rows={5} placeholder={t("jobDescription")} />
            <div className="flex flex-wrap gap-3">
              <select name="tone" className="h-9 rounded-md border bg-white px-3 text-sm">
                {["PROFESSIONAL", "CONFIDENT", "WARM", "EXECUTIVE"].map((tone) => (
                  <option key={tone} value={tone}>
                    {tone}
                  </option>
                ))}
              </select>
              <Button type="submit" className="bg-teal-700 text-white hover:bg-teal-800">
                <WandSparkles className="size-4" />
                {t("generate")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {letters.map((letter) => (
          <Card key={letter.id} className="bg-white">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <FileText className="size-6 text-teal-700" />
                <Badge variant="outline" className="rounded-md">
                  {letter.tone}
                </Badge>
              </div>
              <CardTitle>{letter.title}</CardTitle>
              <p className="text-sm text-neutral-600">{letter.companyName}</p>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href={`/${locale}/cover-letter/${letter.id}`}>{t("openEditor")}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
