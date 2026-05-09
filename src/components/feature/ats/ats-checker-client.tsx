"use client";

import { useState, useTransition } from "react";
import { useDropzone } from "react-dropzone";
import { FileUp, Gauge, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { interpretScore, type AtsScoreResult } from "@/lib/ats-scoring";
import { scoreAtsResumeAction } from "@/server/actions/ats/score-resume";

export function AtsCheckerClient({
  labels,
}: {
  labels: {
    uploadTitle: string;
    uploadBody: string;
    pasteLabel: string;
    jdLabel: string;
    analyze: string;
    scoreTitle: string;
    issues: string;
    suggestions: string;
    jdMatch: string;
  };
}) {
  const [file, setFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<AtsScoreResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: false,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
    },
    maxSize: 5 * 1024 * 1024,
    onDrop: (accepted) => setFile(accepted[0] ?? null),
  });

  function analyze() {
    const formData = new FormData();
    formData.set("resumeText", resumeText);
    formData.set("jobDescription", jobDescription);
    if (file) formData.set("resumeFile", file);

    startTransition(async () => {
      setResult(await scoreAtsResumeAction(formData));
    });
  }

  const interpretation = result ? interpretScore(result.overall) : null;

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>{labels.uploadTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div
            {...getRootProps()}
            className={`flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition ${isDragActive ? "border-teal-500 bg-teal-50" : "border-neutral-200 bg-neutral-50"}`}
          >
            <input {...getInputProps()} />
            <FileUp className="size-10 text-teal-700" />
            <p className="mt-3 font-medium text-neutral-950">{file?.name ?? labels.uploadBody}</p>
            <p className="mt-1 text-sm text-neutral-500">PDF, DOC, DOCX, TXT up to 5MB</p>
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-800">{labels.pasteLabel}</label>
            <Textarea className="mt-2" rows={8} value={resumeText} onChange={(event) => setResumeText(event.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-800">{labels.jdLabel}</label>
            <Textarea className="mt-2" rows={5} value={jobDescription} onChange={(event) => setJobDescription(event.target.value)} />
          </div>
          <Button type="button" className="w-full bg-teal-700 text-white hover:bg-teal-800" disabled={isPending || (!file && !resumeText.trim())} onClick={analyze}>
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <Gauge className="size-4" />}
            {labels.analyze}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>{labels.scoreTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          {result && interpretation ? (
            <div className="space-y-6">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="text-6xl font-semibold tracking-tight text-neutral-950">{result.overall}</div>
                  <Badge className="mt-2 rounded-md bg-teal-700">{interpretation.label}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Score label="Format" value={result.format} />
                  <Score label="Content" value={result.content} />
                  <Score label="Keywords" value={result.keywords} />
                  <Score label="Length" value={result.length} />
                </div>
              </div>
              {typeof result.jdKeywordMatchPct === "number" ? (
                <div className="rounded-md border bg-amber-50 p-4">
                  <div className="font-semibold text-amber-950">{labels.jdMatch}: {result.jdKeywordMatchPct}%</div>
                  <p className="mt-2 text-sm leading-6 text-amber-950/75">{result.jdTopKeywords?.slice(0, 12).join(", ")}</p>
                </div>
              ) : null}
              <List title={labels.issues} items={result.issues} />
              <List title={labels.suggestions} items={result.suggestions} />
            </div>
          ) : (
            <div className="rounded-lg border bg-neutral-50 p-8 text-center text-sm text-neutral-600">{labels.uploadBody}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Score({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border bg-neutral-50 p-3">
      <div className="text-xl font-semibold text-neutral-950">{value}/25</div>
      <div className="text-xs text-neutral-500">{label}</div>
    </div>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="font-semibold text-neutral-950">{title}</h3>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-neutral-700">
        {items.length ? items.map((item) => <li key={item}>{item}</li>) : <li>No major items found.</li>}
      </ul>
    </div>
  );
}
