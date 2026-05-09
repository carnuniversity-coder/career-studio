import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Download } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { defaultLocale, isLocale } from "@/i18n-config";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { coverLetterContentToText, parseCoverLetterContent } from "@/lib/resume-content";
import { updateCoverLetterAction } from "@/server/actions/resumes/create-resume";

type CoverLetterEditorProps = {
  params: Promise<{ locale: string; letterId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: CoverLetterEditorProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = await getTranslations({ locale, namespace: "phase3.meta.coverLetterEditor" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function CoverLetterEditorPage({ params, searchParams }: CoverLetterEditorProps) {
  const { locale: rawLocale, letterId } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const query = await searchParams;
  const t = await getTranslations({ locale, namespace: "phase3.coverLetterEditor" });
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/${locale}/auth/sign-in`);
  }

  const letter = await prisma.coverLetter.findFirst({
    where: { id: letterId, userId: session.user.id },
  });

  if (!letter) {
    notFound();
  }

  const content = parseCoverLetterContent(letter.content);
  const action = updateCoverLetterAction.bind(null, locale, letter.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">{letter.title}</h1>
          <p className="mt-2 text-sm text-neutral-600">{query.saved ? t("saved") : t("subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href={`/api/cover-letter/${letter.id}/export/pdf`}>
              <Download className="size-4" />
              PDF
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/api/cover-letter/${letter.id}/export/docx`}>
              <Download className="size-4" />
              DOCX
            </Link>
          </Button>
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>{t("sections")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={action} className="space-y-4">
              <Textarea name="headerContact" rows={2} defaultValue={content.headerContact} />
              <Textarea name="recipientDetails" rows={3} defaultValue={content.recipientDetails} />
              <Textarea name="opener" rows={4} defaultValue={content.opener} />
              <Textarea name="bodyParagraphs" rows={8} defaultValue={content.bodyParagraphs.join("\n\n")} />
              <Textarea name="achievements" rows={4} defaultValue={content.achievements.map((item) => `- ${item}`).join("\n")} />
              <Textarea name="closing" rows={3} defaultValue={content.closing} />
              <Textarea name="signature" rows={2} defaultValue={content.signature} />
              <Button type="submit" className="bg-teal-700 text-white hover:bg-teal-800">
                {t("save")}
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>{t("preview")}</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap rounded-md bg-neutral-50 p-5 text-sm leading-7 text-neutral-800">
              {coverLetterContentToText(content)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
