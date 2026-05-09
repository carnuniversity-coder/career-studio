import { NextResponse } from "next/server";
import { pdf, type DocumentProps } from "@react-pdf/renderer";
import { createElement } from "react";
import type { ReactElement } from "react";

import { ResumePdfDocument } from "@/lib/pdf/resume-document";
import { auth } from "@/lib/auth";
import { getResumePlainTextForExport } from "@/server/services/resumes/export-service";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ resumeId: string }> }) {
  const session = await auth();
  const { resumeId } = await context.params;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resume = await getResumePlainTextForExport(session.user.id, resumeId);
  if (!resume) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const document = createElement(ResumePdfDocument, { content: resume.content }) as ReactElement<DocumentProps>;
  const blob = await pdf(document).toBlob();
  return new NextResponse(await blob.arrayBuffer(), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${resume.title.replace(/[^a-z0-9-]+/gi, "_")}.pdf"`,
    },
  });
}
