"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AtsHistoryEntry } from "@/server/actions/ats/list-history";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const bandClass: Record<AtsHistoryEntry["bandKey"], string> = {
  excellent: "bg-emerald-600",
  good: "bg-teal-700",
  fair: "bg-amber-600",
  poor: "bg-rose-600",
};

export function ScoreHistoryChart({ entries }: { entries: AtsHistoryEntry[] }) {
  if (entries.length === 0) {
    return (
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Score history</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-neutral-600">
            No scans yet. Run an ATS check from the main page — your scores will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  const data = entries.map((e) => ({
    date: formatDate(e.createdAt),
    Overall: e.overallScore,
    Format: e.formatScore,
    Content: e.contentScore,
    Keywords: e.keywordsScore,
    Length: e.lengthScore,
  }));

  const first = entries[0];
  const latest = entries[entries.length - 1];
  const delta = latest.overallScore - first.overallScore;
  const best = entries.reduce((a, b) => (b.overallScore > a.overallScore ? b : a));

  return (
    <div className="space-y-6">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Score trend ({entries.length} scan{entries.length === 1 ? "" : "s"})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            <Stat label="Latest" value={latest.overallScore} sub={latest.bandLabel} />
            <Stat label="Best" value={best.overallScore} sub={formatDate(best.createdAt)} />
            <Stat
              label="Change since first"
              value={delta >= 0 ? `+${delta}` : `${delta}`}
              sub={`from ${first.overallScore}`}
              tone={delta > 0 ? "good" : delta < 0 ? "bad" : "neutral"}
            />
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="Overall" stroke="#0f766e" strokeWidth={3} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Format" stroke="#0284c7" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="Content" stroke="#a16207" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="Keywords" stroke="#7c3aed" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="Length" stroke="#dc2626" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <ScansTable entries={entries} />
    </div>
  );
}

function ScansTable({ entries }: { entries: AtsHistoryEntry[] }) {
  const router = useRouter();
  const routeParams = useParams<{ locale?: string }>();
  const locale = routeParams?.locale ?? "en";
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(id: string, checked: boolean) {
    setSelected((prev) => {
      if (checked) {
        // Keep at most 2 selected; drop the oldest if a 3rd is added.
        const next = prev.includes(id) ? prev : [...prev, id];
        return next.slice(-2);
      }
      return prev.filter((x) => x !== id);
    });
  }

  function compare() {
    if (selected.length !== 2) return;
    const [a, b] = selected;
    router.push(`/${locale}/ats/compare?a=${a}&b=${b}`);
  }

  return (
    <Card className="bg-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>All scans</CardTitle>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={compare}
          disabled={selected.length !== 2}
        >
          Compare selected ({selected.length}/2)
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wide text-neutral-500">
                <th className="py-2 w-10"></th>
                <th>Date</th>
                <th>Filename</th>
                <th className="text-right">Overall</th>
                <th>Band</th>
                <th className="text-right">JD %</th>
                <th className="text-right">PDF</th>
              </tr>
            </thead>
            <tbody>
              {[...entries].reverse().map((e) => {
                const isSel = selected.includes(e.id);
                return (
                  <tr key={e.id} className={`border-b last:border-b-0 ${isSel ? "bg-teal-50/50" : ""}`}>
                    <td className="py-2">
                      <input
                        type="checkbox"
                        className="size-4 accent-teal-700"
                        checked={isSel}
                        onChange={(event) => toggle(e.id, event.target.checked)}
                        aria-label={`Select ${e.filename} for comparison`}
                      />
                    </td>
                    <td className="text-neutral-600">{new Date(e.createdAt).toLocaleString()}</td>
                    <td className="font-medium text-neutral-900">{e.filename}</td>
                    <td className="text-right font-semibold">{e.overallScore}</td>
                    <td>
                      <Badge className={`${bandClass[e.bandKey]} text-white`}>{e.bandLabel}</Badge>
                    </td>
                    <td className="text-right text-neutral-700">
                      {e.jdKeywordMatchPct === null ? "—" : `${e.jdKeywordMatchPct}%`}
                    </td>
                    <td className="text-right">
                      <a
                        className="text-teal-700 hover:underline"
                        href={`/api/ats/${e.id}/export/pdf`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Download
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({
  label,
  value,
  sub,
  tone = "neutral",
}: {
  label: string;
  value: number | string;
  sub: string;
  tone?: "good" | "bad" | "neutral";
}) {
  const valueClass =
    tone === "good" ? "text-emerald-700" : tone === "bad" ? "text-rose-700" : "text-neutral-900";
  return (
    <div className="rounded-md border bg-neutral-50 p-3">
      <div className="text-xs uppercase tracking-wide text-neutral-500">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${valueClass}`}>{value}</div>
      <div className="text-xs text-neutral-500">{sub}</div>
    </div>
  );
}
