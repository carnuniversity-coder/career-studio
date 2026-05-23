"use client";

/**
 * Side-by-side career comparison from the Career GPS constellation.
 *
 * The plan already contains a constellation of 8-15 careers with match
 * %, difficulty, salary band, domain, and nearest neighbours. This
 * panel lets the user pick any 2 and view them side-by-side without
 * regenerating the plan or paying for another Gemini call.
 */

import { useState } from "react";
import { ArrowLeftRight, Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type ConstellationNode = {
  id: string;
  role: string;
  domain: string;
  match: number;
  salary_lkr: string;
  difficulty: number;
  difficulty_label: string;
  summary: string;
  nearest_neighbours: string[];
};

export function CareerCompareCard({ constellation }: { constellation: ConstellationNode[] }) {
  const [leftId, setLeftId] = useState<string | null>(constellation[0]?.id ?? null);
  const [rightId, setRightId] = useState<string | null>(constellation[1]?.id ?? null);

  const left = constellation.find((c) => c.id === leftId) ?? null;
  const right = constellation.find((c) => c.id === rightId) ?? null;

  if (constellation.length < 2) return null;

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowLeftRight className="size-4 text-teal-700" />
          Compare two careers
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <CareerPicker
            label="Career A"
            value={leftId}
            onChange={setLeftId}
            disabled={rightId}
            options={constellation}
          />
          <CareerPicker
            label="Career B"
            value={rightId}
            onChange={setRightId}
            disabled={leftId}
            options={constellation}
          />
        </div>

        {left && right ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <CareerCard node={left} highlightHigher={left.match >= right.match} />
            <CareerCard node={right} highlightHigher={right.match > left.match} />
          </div>
        ) : (
          <p className="text-xs italic text-neutral-500">
            Pick two careers from the constellation to see them side by side.
          </p>
        )}

        {left && right ? <Diff left={left} right={right} /> : null}
      </CardContent>
    </Card>
  );
}

function CareerPicker({
  label,
  value,
  onChange,
  disabled,
  options,
}: {
  label: string;
  value: string | null;
  onChange: (next: string | null) => void;
  disabled: string | null;
  options: ConstellationNode[];
}) {
  return (
    <label className="block text-sm">
      <span className="block text-xs font-semibold uppercase tracking-wide text-neutral-500">{label}</span>
      <select
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value || null)}
        className="mt-1 h-9 w-full rounded-md border bg-white px-3 text-sm"
      >
        <option value="">— pick a career —</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id} disabled={opt.id === disabled}>
            {opt.role} ({opt.match}%)
          </option>
        ))}
      </select>
    </label>
  );
}

function CareerCard({ node, highlightHigher }: { node: ConstellationNode; highlightHigher: boolean }) {
  return (
    <div className={`rounded-md border p-3 ${highlightHigher ? "border-teal-300 bg-teal-50/50" : "bg-neutral-50"}`}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-semibold text-neutral-900">{node.role}</span>
        {highlightHigher ? <Trophy className="size-3.5 text-teal-700" /> : null}
      </div>
      <div className="text-xs text-neutral-500">{node.domain}</div>
      <div className="mt-2 grid grid-cols-3 gap-2 text-center text-[10px]">
        <Stat label="Match" value={`${node.match}%`} />
        <Stat label="Difficulty" value={node.difficulty_label} />
        <Stat label="Salary" value={node.salary_lkr.replace(/Rs\s?/, "")} />
      </div>
      <p className="mt-2 line-clamp-3 text-xs text-neutral-700">{node.summary}</p>
      {node.nearest_neighbours.length > 0 ? (
        <div className="mt-2">
          <div className="text-[10px] uppercase tracking-wide text-neutral-500">Adjacent roles</div>
          <div className="mt-1 flex flex-wrap gap-1">
            {node.nearest_neighbours.slice(0, 3).map((n) => (
              <Badge key={n} variant="outline" className="text-[10px]">{n}</Badge>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded bg-white p-1">
      <div className="text-[10px] uppercase tracking-wide text-neutral-500">{label}</div>
      <div className="font-semibold text-neutral-900">{value}</div>
    </div>
  );
}

function Diff({ left, right }: { left: ConstellationNode; right: ConstellationNode }) {
  const rows: Array<{ label: string; a: string | number; b: string | number; better?: "a" | "b" | "tie" }> = [
    { label: "Match", a: `${left.match}%`, b: `${right.match}%`, better: left.match === right.match ? "tie" : left.match > right.match ? "a" : "b" },
    { label: "Difficulty", a: left.difficulty_label, b: right.difficulty_label, better: left.difficulty === right.difficulty ? "tie" : left.difficulty > right.difficulty ? "a" : "b" },
    { label: "Salary band", a: left.salary_lkr, b: right.salary_lkr },
    { label: "Domain", a: left.domain, b: right.domain },
  ];

  return (
    <div className="overflow-hidden rounded-md border">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-neutral-50 text-left">
            <th className="px-3 py-2 font-semibold text-neutral-500">Metric</th>
            <th className="px-3 py-2 font-semibold text-neutral-900">{left.role}</th>
            <th className="px-3 py-2 font-semibold text-neutral-900">{right.role}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-t">
              <td className="px-3 py-2 text-neutral-600">{row.label}</td>
              <td className={`px-3 py-2 ${row.better === "a" ? "font-semibold text-teal-700" : "text-neutral-800"}`}>
                {row.a}
              </td>
              <td className={`px-3 py-2 ${row.better === "b" ? "font-semibold text-teal-700" : "text-neutral-800"}`}>
                {row.b}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

