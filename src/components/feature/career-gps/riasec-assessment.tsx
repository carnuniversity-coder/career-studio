"use client";

/**
 * 24-question RIASEC card.
 *
 * Embedded into the Career GPS form. Each question is a 1-5 Likert
 * radio. On every change we compute the running top-3 code and write
 * it into the form's hidden `hollandCode` field so the existing plan
 * generator picks it up unchanged.
 *
 * Users who already know their code can skip the assessment by typing
 * the 3 letters into the manual input above.
 */

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  computeRiasecCode,
  RIASEC_QUESTIONS,
  RIASEC_TYPE_LABELS,
  type RiasecType,
} from "@/lib/riasec";

const SCALE = [
  { value: 1, label: "Strongly disagree" },
  { value: 2, label: "Disagree" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Agree" },
  { value: 5, label: "Strongly agree" },
];

const TONE: Record<RiasecType, string> = {
  R: "bg-stone-100 text-stone-800",
  I: "bg-sky-100 text-sky-800",
  A: "bg-rose-100 text-rose-800",
  S: "bg-emerald-100 text-emerald-800",
  E: "bg-amber-100 text-amber-800",
  C: "bg-indigo-100 text-indigo-800",
};

export function RiasecAssessment({
  hiddenInputName = "hollandCode",
}: {
  hiddenInputName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const result = useMemo(() => computeRiasecCode(answers), [answers]);
  const answeredCount = Object.keys(answers).length;
  const total = RIASEC_QUESTIONS.length;

  function setAnswer(id: string, value: number) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  return (
    <div className="rounded-md border bg-white">
      <button
        type="button"
        onClick={() => setOpen((x) => !x)}
        className="flex w-full items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="size-4 text-teal-700" />
          <div>
            <div className="text-sm font-semibold text-neutral-950">
              Take a 24-question Holland (RIASEC) assessment
            </div>
            <div className="text-xs text-neutral-500">
              Skip if you already know your code. Takes about 3 minutes.
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {answeredCount > 0 ? (
            <Badge variant="outline" className="text-[10px]">
              {answeredCount}/{total} answered
            </Badge>
          ) : null}
          {result.code && answeredCount >= 6 ? (
            <Badge className="rounded-md bg-teal-700 text-white">{result.code}</Badge>
          ) : null}
          {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </div>
      </button>

      {open ? (
        <div className="space-y-4 border-t p-4">
          <p className="text-xs text-neutral-600">
            Rate how much each statement sounds like you. Higher means more like you.
          </p>

          <ol className="space-y-3">
            {RIASEC_QUESTIONS.map((q, idx) => (
              <li key={q.id} className="rounded-md border bg-neutral-50 p-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-semibold text-neutral-500">{idx + 1}.</span>
                  <p className="flex-1 text-sm text-neutral-900">{q.prompt}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${TONE[q.type]}`}>
                    {q.type}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-5 gap-1">
                  {SCALE.map((s) => {
                    const selected = answers[q.id] === s.value;
                    return (
                      <label
                        key={s.value}
                        className={`cursor-pointer rounded-md border px-2 py-2 text-center text-[11px] transition ${
                          selected
                            ? "border-teal-600 bg-teal-50 text-teal-900"
                            : "border-neutral-200 text-neutral-600 hover:border-neutral-400"
                        }`}
                      >
                        <input
                          type="radio"
                          name={q.id}
                          value={s.value}
                          checked={selected}
                          onChange={() => setAnswer(q.id, s.value)}
                          className="sr-only"
                        />
                        <div className="text-sm font-semibold">{s.value}</div>
                        <div className="hidden sm:block text-[9px] opacity-70">{s.label}</div>
                      </label>
                    );
                  })}
                </div>
              </li>
            ))}
          </ol>

          {answeredCount >= 6 ? (
            <div className="rounded-md border border-teal-200 bg-teal-50 p-3">
              <div className="text-xs uppercase tracking-wide text-teal-800">Your Holland code</div>
              <div className="mt-1 flex items-baseline gap-3">
                <span className="text-3xl font-semibold text-teal-900">{result.code}</span>
                <span className="text-xs text-teal-800">
                  {result.ranked
                    .slice(0, 3)
                    .map((r) => `${RIASEC_TYPE_LABELS[r.type].label} (${r.score})`)
                    .join(" · ")}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-teal-800/80">
                This will flow into the plan generation as your dominant interests.
              </p>
            </div>
          ) : (
            <p className="text-[11px] text-neutral-500">
              Answer at least 6 questions to see a result.
            </p>
          )}

          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setAnswers({})} disabled={answeredCount === 0}>
              Clear answers
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      ) : null}

      {/* Hidden input feeds the computed code into the Career GPS form. */}
      <input type="hidden" name={hiddenInputName} value={result.code} />
    </div>
  );
}
