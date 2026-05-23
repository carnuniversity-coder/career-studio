import type { Metadata } from "next";
import Link from "next/link";

import { ScoreHistoryChart } from "@/components/feature/ats/score-history-chart";
import { Button } from "@/components/ui/button";
import { defaultLocale, isLocale } from "@/i18n-config";
import { listAtsHistoryAction } from "@/server/actions/ats/list-history";

type AtsHistoryPageProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: "ATS Score History",
  description: "Track your resume's ATS score across past scans.",
};

export default async function AtsHistoryPage({ params }: AtsHistoryPageProps) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const entries = await listAtsHistoryAction();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">ATS Score History</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
            Every CV you&apos;ve analysed, scored, and tracked over time. Use the trend to confirm that each revision is actually improving things.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/${locale}/ats`}>Run new scan</Link>
        </Button>
      </div>

      <ScoreHistoryChart entries={entries} />
    </div>
  );
}
