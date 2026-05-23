"use server";

import { randomUUID } from "crypto";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Unified share-token toggle for every shareable entity on the platform.
 *
 * Each shareable model carries a nullable `shareToken` and `sharedAt`.
 * Enabling sharing generates a random UUID and stamps the time. The
 * public route then requires both `shareToken` to be set AND the
 * `?token=` query param to match. Without the token the public page
 * returns 404 even if a visitor guesses the row UUID.
 *
 * Ownership check is performed per-entity using the user-id field on
 * each model. Career GPS plans go via the parent session.
 */

export type ShareKind = "resume" | "cover-letter" | "gcv" | "linkedin" | "career-gps";

export type ShareToggleResult = {
  isShared: boolean;
  shareToken: string | null;
  sharedAt: string | null;
};

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorised");
  return session.user.id;
}

async function assertOwnership(kind: ShareKind, id: string, userId: string) {
  switch (kind) {
    case "resume": {
      const row = await prisma.resume.findUnique({
        where: { id },
        select: { userId: true },
      });
      if (!row || row.userId !== userId) throw new Error("Resume not found");
      return;
    }
    case "cover-letter": {
      const row = await prisma.coverLetter.findUnique({
        where: { id },
        select: { userId: true },
      });
      if (!row || row.userId !== userId) throw new Error("Cover letter not found");
      return;
    }
    case "gcv": {
      const row = await prisma.gCVResume.findUnique({
        where: { id },
        select: { userId: true },
      });
      if (!row || row.userId !== userId) throw new Error("GCV not found");
      return;
    }
    case "linkedin": {
      const row = await prisma.linkedInAudit.findUnique({
        where: { id },
        select: { userId: true },
      });
      if (!row || row.userId !== userId) throw new Error("LinkedIn audit not found");
      return;
    }
    case "career-gps": {
      const plan = await prisma.careerGPSPlan.findUnique({
        where: { id },
        select: { sessionId: true },
      });
      if (!plan) throw new Error("Career GPS plan not found");
      const session = await prisma.careerGPSSession.findUnique({
        where: { id: plan.sessionId },
        select: { userId: true },
      });
      if (!session || session.userId !== userId) throw new Error("Career GPS plan not found");
      return;
    }
  }
}

export async function setShareTokenAction(
  kind: ShareKind,
  id: string,
  isShared: boolean,
): Promise<ShareToggleResult> {
  const userId = await requireUserId();
  await assertOwnership(kind, id, userId);

  const data = isShared
    ? { shareToken: randomUUID(), sharedAt: new Date() }
    : { shareToken: null, sharedAt: null };

  let result: { shareToken: string | null; sharedAt: Date | null };

  switch (kind) {
    case "resume":
      result = await prisma.resume.update({ where: { id }, data, select: { shareToken: true, sharedAt: true } });
      break;
    case "cover-letter":
      result = await prisma.coverLetter.update({ where: { id }, data, select: { shareToken: true, sharedAt: true } });
      break;
    case "gcv":
      result = await prisma.gCVResume.update({ where: { id }, data, select: { shareToken: true, sharedAt: true } });
      break;
    case "linkedin":
      result = await prisma.linkedInAudit.update({ where: { id }, data, select: { shareToken: true, sharedAt: true } });
      break;
    case "career-gps":
      result = await prisma.careerGPSPlan.update({ where: { id }, data, select: { shareToken: true, sharedAt: true } });
      break;
  }

  return {
    isShared: !!result.shareToken,
    shareToken: result.shareToken,
    sharedAt: result.sharedAt?.toISOString() ?? null,
  };
}
