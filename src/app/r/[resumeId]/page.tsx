import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { ResumePreview } from "@/components/feature/resumes/resume-preview";
import { parseResumeContent } from "@/lib/resume-content";
import { prisma } from "@/lib/prisma";
import { recordShareView } from "@/lib/share-views";

type PublicResumePageProps = {
  params: Promise<{ resumeId: string }>;
  searchParams: Promise<{ pw?: string; token?: string }>;
};

export default async function PublicResumePage({ params, searchParams }: PublicResumePageProps) {
  const { resumeId } = await params;
  const { pw, token } = await searchParams;
  const resume = await prisma.resume.findUnique({
    where: { id: resumeId },
    include: { content: true },
  });

  if (!resume?.content) {
    notFound();
  }

  const content = parseResumeContent(resume.content.data);
  const access = content.settings?.publicAccess ?? "private";
  // Token-based sharing is an alternative entry path. If the row has a
  // shareToken AND the URL provides a matching one, allow regardless of
  // the in-content access setting. Otherwise fall through to the
  // existing publicAccess logic.
  const tokenMatches = !!resume.shareToken && !!token && resume.shareToken === token;

  if (!tokenMatches && access === "private") {
    notFound();
  }

  if (!tokenMatches && access === "password" && content.settings?.publicPassword && pw !== content.settings.publicPassword) {
    return (
      <main className="min-h-screen bg-slate-100 px-4 py-16">
        <form className="mx-auto max-w-sm rounded-lg border bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-950">Protected resume</h1>
          <p className="mt-2 text-sm text-slate-600">Enter the password shared by the resume owner.</p>
          <input
            name="pw"
            type="password"
            className="mt-4 h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
            placeholder="Password"
          />
          <button className="mt-3 h-10 w-full rounded-md bg-teal-700 text-sm font-semibold text-white" type="submit">
            View resume
          </button>
        </form>
      </main>
    );
  }

  await recordShareView({
    type: "resume",
    itemId: resumeId,
    ownerId: resume.userId,
    headers: await headers(),
  });

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <ResumePreview content={content} />
      </div>
    </main>
  );
}
