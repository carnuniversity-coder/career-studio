"use server";

import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { interpretScore } from "@/lib/ats-scoring";
import { prisma } from "@/lib/prisma";

export type AtsHistoryEntry = {
  id: string;
  cvDocumentId: string;
  filename: string;
  overallScore: number;
  formatScore: number;
  contentScore: number;
  keywordsScore: number;
  lengthScore: number;
  jdKeywordMatchPct: number | null;
  bandLabel: string;
  bandKey: "poor" | "fair" | "good" | "excellent";
  createdAt: string; // ISO
};

export async function listAtsHistoryAction(): Promise<AtsHistoryEntry[]> {
  const session = await auth();
  if (!session?.user?.id) redirect("/en/auth/sign-in");

  const rows = await prisma.aTSCheckResult.findMany({
    where: { cvDocument: { userId: session.user.id } },
    include: { cvDocument: { select: { id: true, filename: true } } },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  return rows.map((row) => {
    const interp = interpretScore(row.overallScore);
    return {
      id: row.id,
      cvDocumentId: row.cvDocument.id,
      filename: row.cvDocument.filename,
      overallScore: row.overallScore,
      formatScore: row.formatScore,
      contentScore: row.contentScore,
      keywordsScore: row.keywordsScore,
      lengthScore: row.lengthScore,
      jdKeywordMatchPct: row.jdKeywordMatchPct,
      bandLabel: interp.label,
      bandKey: interp.band,
      createdAt: row.createdAt.toISOString(),
    };
  });
}
