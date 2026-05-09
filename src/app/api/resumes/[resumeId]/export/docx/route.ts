import { Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";
import { NextResponse } from "next/server";

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

  const content = resume.content;
  const children = [
    new Paragraph({ text: content.header.fullName || resume.title, heading: HeadingLevel.TITLE }),
    new Paragraph({ text: content.header.title }),
    new Paragraph({ text: [content.header.email, content.header.phone, content.header.location].filter(Boolean).join(" | ") }),
    new Paragraph({ text: "Summary", heading: HeadingLevel.HEADING_2 }),
    new Paragraph({ text: content.summary }),
    new Paragraph({ text: "Experience", heading: HeadingLevel.HEADING_2 }),
    ...content.experience.flatMap((item) => [
      new Paragraph({ children: [new TextRun({ text: [item.title, item.company].filter(Boolean).join(" - "), bold: true })] }),
      ...item.bullets.filter(Boolean).map((bullet) => new Paragraph({ text: bullet, bullet: { level: 0 } })),
    ]),
    new Paragraph({ text: "Education", heading: HeadingLevel.HEADING_2 }),
    ...content.education.map((item) => new Paragraph({ text: [item.degree, item.field, item.institution].filter(Boolean).join(" - ") })),
    new Paragraph({ text: "Skills", heading: HeadingLevel.HEADING_2 }),
    new Paragraph({ text: content.skills.join(", ") }),
  ];
  const document = new Document({ sections: [{ children }] });
  const buffer = await Packer.toBuffer(document);

  return new NextResponse(new Blob([new Uint8Array(buffer)]), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${resume.title.replace(/[^a-z0-9-]+/gi, "_")}.docx"`,
    },
  });
}
