import { NextResponse } from "next/server";
import { pdf, type DocumentProps } from "@react-pdf/renderer";
import { createElement, type ReactElement } from "react";

import { auth } from "@/lib/auth";
import { careerGpsPlanResultSchema } from "@/lib/career-gps";
import { CareerGpsPdfDocument } from "@/lib/pdf/career-gps-roadmap";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/**
 * Public-by-token PDF export of a Career GPS plan.
 *
 * Two access modes:
 *   - Authenticated owner: signed-in user owns the plan's parent session.
 *   - Public via shareToken: ?token=<plan.shareToken> matches.
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ planId: string }> },
) {
  const { planId } = await context.params;
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  const plan = await prisma.careerGPSPlan.findUnique({ where: { id: planId } });
  if (!plan) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Allow access if (a) the plan has a matching shareToken in URL OR
  // (b) the requester is authenticated and owns the parent session.
  let allowed = false;
  if (plan.shareToken && token && plan.shareToken === token) {
    allowed = true;
  } else {
    const session = await auth();
    if (session?.user?.id) {
      const parent = await prisma.careerGPSSession.findUnique({
        where: { id: plan.sessionId },
        select: { userId: true },
      });
      if (parent && parent.userId === session.user.id) {
        allowed = true;
      }
    }
  }

  if (!allowed) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const parsed = careerGpsPlanResultSchema.safeParse(plan.planJson);
  if (!parsed.success) {
    return NextResponse.json({ error: "Plan data unreadable" }, { status: 500 });
  }

  const document = createElement(CareerGpsPdfDocument, {
    data: {
      title: parsed.data.pathways[0]?.role
        ? `Roadmap — ${parsed.data.pathways[0].role}`
        : "Career GPS Roadmap",
      generatedAt: plan.createdAt,
      plan: parsed.data,
    },
  }) as ReactElement<DocumentProps>;
  const blob = await pdf(document).toBlob();

  return new NextResponse(await blob.arrayBuffer(), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="career-gps-roadmap.pdf"`,
    },
  });
}
