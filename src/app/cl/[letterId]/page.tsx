import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { coverLetterContentToText, parseCoverLetterContent } from "@/lib/resume-content";
import { recordShareView } from "@/lib/share-views";

type ShareCoverLetterPageProps = {
  params: Promise<{ letterId: string }>;
  searchParams: Promise<{ token?: string }>;
};

export default async function ShareCoverLetterPage({ params, searchParams }: ShareCoverLetterPageProps) {
  const { letterId } = await params;
  const { token } = await searchParams;
  const letter = await prisma.coverLetter.findUnique({ where: { id: letterId } });

  if (!letter) {
    notFound();
  }
  // Hard ownership gate: no shareToken set OR no ?token= in URL OR mismatch → 404.
  if (!letter.shareToken || !token || letter.shareToken !== token) {
    notFound();
  }

  const content = parseCoverLetterContent(letter.content);
  await recordShareView({
    type: "cover-letter",
    itemId: letterId,
    ownerId: letter.userId,
    headers: await headers(),
  });

  return (
    <main className="min-h-screen bg-neutral-100 px-4 py-8 text-neutral-950">
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">{letter.title}</h1>
            <p className="text-sm text-neutral-600">{letter.jobTitle} at {letter.companyName}</p>
          </div>
          <Badge className="rounded-md bg-teal-700 text-white">{content.qualityScore || 0}/100 {content.qualityLabel}</Badge>
        </div>
        <Card className="bg-white">
          <CardContent className="p-8">
            <article
              className="prose prose-neutral max-w-none whitespace-pre-wrap text-sm leading-7"
              style={{ borderTop: `4px solid ${content.accentColor || "#0f766e"}`, paddingTop: "1rem" }}
            >
              {coverLetterContentToText(content)}
            </article>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
