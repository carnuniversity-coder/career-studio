"use server";

import type { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { scoreResumeText, type AtsScoreResult } from "@/lib/ats-scoring";
import { prisma } from "@/lib/prisma";
import { assertFileSize, detectFileMime, resumeMimeTypes } from "@/lib/validators";

function formValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

async function requireUser() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/en/auth/sign-in");
  }

  return session.user;
}

export async function scoreAtsResumeAction(formData: FormData): Promise<AtsScoreResult> {
  const user = await requireUser();
  const pastedText = formValue(formData, "resumeText");
  const jobDescription = formValue(formData, "jobDescription");
  const uploaded = formData.get("resumeFile");
  let resumeText = pastedText;
  let filename = "Pasted resume text";
  let fileSize = Buffer.byteLength(pastedText);
  let fileType = "text";

  if (uploaded instanceof File && uploaded.size > 0) {
    const buffer = Buffer.from(await uploaded.arrayBuffer());
    assertFileSize(uploaded.size, 5 * 1024 * 1024);
    const detectedMime = await detectFileMime(buffer);
    const browserMime = uploaded.type || detectedMime;

    if (!resumeMimeTypes.has(browserMime) && browserMime !== "text/plain" && detectedMime !== "application/octet-stream") {
      throw new Error("Unsupported resume file type");
    }

    filename = uploaded.name;
    fileSize = uploaded.size;
    fileType = uploaded.name.split(".").pop()?.toLowerCase() ?? "file";
    if (!resumeText.trim()) {
      resumeText = buffer.toString("utf8").replace(/[^\x09\x0a\x0d\x20-\x7E]+/g, " ").replace(/\s+/g, " ").trim();
    }
  }

  const result = scoreResumeText(resumeText, jobDescription);
  const cvDocument = await prisma.cVDocument.create({
    data: {
      userId: user.id,
      filePath: filename,
      filename,
      fileType,
      fileSize,
      extractedText: resumeText,
    },
  });

  await prisma.aTSCheckResult.create({
    data: {
      cvDocumentId: cvDocument.id,
      overallScore: result.overall,
      formatScore: result.format,
      contentScore: result.content,
      keywordsScore: result.keywords,
      lengthScore: result.length,
      jdKeywordMatchPct: result.jdKeywordMatchPct,
      jdTopKeywords: (result.jdTopKeywords ?? []) as Prisma.InputJsonValue,
      scores: result.breakdown as Prisma.InputJsonValue,
      issues: result.issues as Prisma.InputJsonValue,
      suggestions: result.suggestions as Prisma.InputJsonValue,
    },
  });

  return result;
}
