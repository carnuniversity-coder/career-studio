import { NextResponse } from "next/server";
import { pdf, type DocumentProps } from "@react-pdf/renderer";
import { createElement } from "react";
import type { ReactElement } from "react";

import { auth } from "@/lib/auth";
import { CoverLetterPdfDocument } from "@/lib/pdf/resume-document";
import { prisma } from "@/lib/prisma";
import { parseCoverLetterContent } from "@/lib/resume-content";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ letterId: string }> }) {
  const session = await auth();
  const { letterId } = await context.params;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const letter = await prisma.coverLetter.findFirst({
    where: { id: letterId, userId: session.user.id },
  });
  if (!letter) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const document = createElement(CoverLetterPdfDocument, { content: parseCoverLetterContent(letter.content) }) as ReactElement<DocumentProps>;
  const blob = await pdf(document).toBlob();

  return new NextResponse(await blob.arrayBuffer(), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${letter.title.replace(/[^a-z0-9-]+/gi, "_")}.pdf"`,
    },
  });
}
