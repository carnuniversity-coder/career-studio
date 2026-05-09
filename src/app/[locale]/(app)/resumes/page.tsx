import type { Metadata } from "next";
import Link from "next/link";
import { Copy, Download, FileText, Plus, Trash2 } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { defaultLocale, isLocale } from "@/i18n-config";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { featuredResumeTemplates } from "@/lib/resume-templates";
import { createResumeFromForm, deleteResumeAction, duplicateResumeAction } from "@/server/actions/resumes/create-resume";

type ResumesPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: ResumesPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = await getTranslations({ locale, namespace: "phase3.meta.resumes" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function ResumesPage({ params }: ResumesPageProps) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = await getTranslations({ locale, namespace: "phase3.resumes" });
  const session = await auth();
  const createAction = createResumeFromForm.bind(null, locale);
  const resumes = session?.user?.id
    ? await prisma.resume.findMany({
        where: { userId: session.user.id },
        orderBy: { updatedAt: "desc" },
        take: 24,
      })
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">{t("title")}</h1>
          <p className="mt-2 text-sm text-neutral-600">{t("subtitle")}</p>
        </div>
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>{t("createTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createAction} className="grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
            <Input name="title" placeholder={t("titlePlaceholder")} required />
            <select name="templateKey" className="h-9 rounded-md border bg-white px-3 text-sm">
              {featuredResumeTemplates.map((template) => (
                <option key={template.templateKey} value={template.templateKey}>
                  {template.roleName} - {template.category}
                </option>
              ))}
            </select>
            <Button type="submit" className="bg-teal-700 text-white hover:bg-teal-800">
              <Plus className="size-4" />
              {t("create")}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {resumes.map((resume) => (
          <Card key={resume.id} className="bg-white">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="flex size-11 items-center justify-center rounded-md bg-teal-100 text-teal-800">
                  <FileText className="size-5" />
                </div>
                <Badge variant="outline" className="rounded-md">
                  {resume.templateKey}
                </Badge>
              </div>
              <CardTitle>{resume.title}</CardTitle>
              <p className="text-sm text-neutral-500">{t("updated")} {resume.updatedAt.toLocaleDateString("en-LK")}</p>
            </CardHeader>
            <CardFooter className="grid gap-2 bg-neutral-50 sm:grid-cols-4">
              <Button asChild variant="outline" className="sm:col-span-1">
                <Link href={`/${locale}/resumes/${resume.id}`}>{t("edit")}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/api/resumes/${resume.id}/export/pdf`}>
                  <Download className="size-4" />
                  PDF
                </Link>
              </Button>
              <form action={duplicateResumeAction.bind(null, locale, resume.id)}>
                <Button type="submit" variant="outline" className="w-full">
                  <Copy className="size-4" />
                </Button>
              </form>
              <form action={deleteResumeAction.bind(null, locale, resume.id)}>
                <Button type="submit" variant="outline" className="w-full text-rose-700">
                  <Trash2 className="size-4" />
                </Button>
              </form>
            </CardFooter>
          </Card>
        ))}
      </div>

      {resumes.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-white p-10 text-center">
          <FileText className="mx-auto size-10 text-teal-700" />
          <h2 className="mt-4 text-xl font-semibold text-neutral-950">{t("emptyTitle")}</h2>
          <p className="mt-2 text-sm text-neutral-600">{t("emptyBody")}</p>
        </div>
      ) : null}
    </div>
  );
}
