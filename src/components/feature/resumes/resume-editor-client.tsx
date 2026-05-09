"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { closestCenter, DndContext, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Sparkles, Trash2 } from "lucide-react";

import { ResumePreview } from "@/components/feature/resumes/resume-preview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createId, resumeSectionKeys, type ResumeContent, type ResumeSectionKey } from "@/lib/resume-content";
import { improveResumeTextAction, saveResumeContentAction } from "@/server/actions/resumes/create-resume";

type ResumeEditorLabels = {
  saveIdle: string;
  saving: string;
  saved: string;
  improve: string;
  add: string;
  remove: string;
  livePreview: string;
  sections: Record<ResumeSectionKey, string>;
};

export function ResumeEditorClient({
  resumeId,
  initialContent,
  labels,
}: {
  resumeId: string;
  initialContent: ResumeContent;
  labels: ResumeEditorLabels;
}) {
  const [content, setContent] = useState(initialContent);
  const [saveState, setSaveState] = useState(labels.saveIdle);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setSaveState(labels.saving);
    const timer = window.setTimeout(() => {
      startTransition(async () => {
        await saveResumeContentAction(resumeId, content);
        setSaveState(labels.saved);
      });
    }, 900);

    return () => window.clearTimeout(timer);
  }, [content, labels.saved, labels.saving, resumeId]);

  const orderedSections = useMemo(
    () => content.sectionOrder.filter((section): section is ResumeSectionKey => resumeSectionKeys.includes(section)),
    [content.sectionOrder]
  );

  function setHeaderField(field: keyof ResumeContent["header"], value: string) {
    setContent((current) => ({ ...current, header: { ...current.header, [field]: value } }));
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = orderedSections.indexOf(active.id as ResumeSectionKey);
    const newIndex = orderedSections.indexOf(over.id as ResumeSectionKey);
    setContent((current) => ({ ...current, sectionOrder: arrayMove(orderedSections, oldIndex, newIndex) }));
  }

  async function improveSummary() {
    const result = await improveResumeTextAction({ text: content.summary || content.header.title || "Professional summary", type: "summary" });
    setSuggestions(result);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(420px,0.9fr)]">
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border bg-white px-4 py-3">
          <span className="text-sm text-neutral-600">{isPending ? labels.saving : saveState}</span>
          <Button type="button" variant="outline" size="sm" onClick={improveSummary}>
            <Sparkles className="size-4" />
            {labels.improve}
          </Button>
        </div>

        {suggestions.length ? (
          <Card className="bg-amber-50">
            <CardContent className="space-y-2 p-4">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  className="block w-full rounded-md border bg-white p-3 text-left text-sm leading-6 hover:bg-neutral-50"
                  onClick={() => setContent((current) => ({ ...current, summary: suggestion }))}
                >
                  {suggestion}
                </button>
              ))}
            </CardContent>
          </Card>
        ) : null}

        <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={orderedSections} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {orderedSections.map((section) => (
                <SortableSection key={section} id={section} title={labels.sections[section]}>
                  {renderEditor(section, content, setContent, setHeaderField, labels)}
                </SortableSection>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <div className="xl:sticky xl:top-20 xl:self-start">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-neutral-950">{labels.livePreview}</h2>
        </div>
        <ResumePreview content={content} />
      </div>
    </div>
  );
}

function SortableSection({ id, title, children }: { id: ResumeSectionKey; title: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  return (
    <Card ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className="bg-white">
      <CardHeader className="flex-row items-center gap-3">
        <button type="button" className="text-neutral-400" {...attributes} {...listeners}>
          <GripVertical className="size-5" />
        </button>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function renderEditor(
  section: ResumeSectionKey,
  content: ResumeContent,
  setContent: React.Dispatch<React.SetStateAction<ResumeContent>>,
  setHeaderField: (field: keyof ResumeContent["header"], value: string) => void,
  labels: ResumeEditorLabels
) {
  if (section === "header") {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {(["fullName", "title", "email", "phone", "location", "linkedin", "website"] as const).map((field) => (
          <div key={field} className="space-y-2">
            <Label htmlFor={field}>{field}</Label>
            <Input id={field} value={content.header[field]} onChange={(event) => setHeaderField(field, event.target.value)} />
          </div>
        ))}
      </div>
    );
  }

  if (section === "summary") {
    return <Textarea rows={5} value={content.summary} onChange={(event) => setContent((current) => ({ ...current, summary: event.target.value }))} />;
  }

  if (section === "skills") {
    return (
      <div className="space-y-3">
        <Textarea
          rows={4}
          value={content.skills.join("\n")}
          onChange={(event) => setContent((current) => ({ ...current, skills: event.target.value.split("\n").map((line) => line.trim()).filter(Boolean) }))}
        />
      </div>
    );
  }

  if (section === "experience") {
    return (
      <div className="space-y-4">
        {content.experience.map((item, index) => (
          <div key={item.id} className="rounded-md border bg-neutral-50 p-4">
            <div className="grid gap-3 md:grid-cols-2">
              <Input value={item.title} placeholder="Role title" onChange={(event) => updateExperience(index, "title", event.target.value, setContent)} />
              <Input value={item.company} placeholder="Company" onChange={(event) => updateExperience(index, "company", event.target.value, setContent)} />
              <Input value={item.location} placeholder="Location" onChange={(event) => updateExperience(index, "location", event.target.value, setContent)} />
              <Input value={`${item.startDate} - ${item.endDate}`} placeholder="Jan 2024 - Present" onChange={(event) => updateExperienceDates(index, event.target.value, setContent)} />
            </div>
            <Textarea
              className="mt-3"
              rows={4}
              value={item.bullets.join("\n")}
              onChange={(event) => updateExperience(index, "bullets", event.target.value.split("\n"), setContent)}
            />
            <Button type="button" variant="ghost" size="sm" className="mt-2 text-rose-700" onClick={() => setContent((current) => ({ ...current, experience: current.experience.filter((_, itemIndex) => itemIndex !== index) }))}>
              <Trash2 className="size-4" />
              {labels.remove}
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={() => setContent((current) => ({ ...current, experience: [...current.experience, { id: createId(), title: "", company: "", location: "", startDate: "", endDate: "", bullets: [""] }] }))}>
          <Plus className="size-4" />
          {labels.add}
        </Button>
      </div>
    );
  }

  if (section === "education") {
    return (
      <div className="space-y-4">
        {content.education.map((item, index) => (
          <div key={item.id} className="grid gap-3 rounded-md border bg-neutral-50 p-4 md:grid-cols-2">
            <Input value={item.degree} placeholder="Degree" onChange={(event) => updateEducation(index, "degree", event.target.value, setContent)} />
            <Input value={item.field} placeholder="Field" onChange={(event) => updateEducation(index, "field", event.target.value, setContent)} />
            <Input value={item.institution} placeholder="Institution" onChange={(event) => updateEducation(index, "institution", event.target.value, setContent)} />
            <Input value={`${item.startDate} - ${item.endDate}`} placeholder="2020 - 2024" onChange={(event) => updateEducationDates(index, event.target.value, setContent)} />
          </div>
        ))}
        <Button type="button" variant="outline" onClick={() => setContent((current) => ({ ...current, education: [...current.education, { id: createId(), institution: "", degree: "", field: "", startDate: "", endDate: "" }] }))}>
          <Plus className="size-4" />
          {labels.add}
        </Button>
      </div>
    );
  }

  if (section === "projects") {
    return <Textarea rows={5} value={content.projects.map((item) => `${item.name}: ${item.description}`).join("\n")} readOnly />;
  }

  return <Textarea rows={4} value={content.certifications.map((item) => `${item.name} - ${item.issuer}`).join("\n")} readOnly />;
}

function updateExperience(
  index: number,
  field: "title" | "company" | "location" | "bullets",
  value: string | string[],
  setContent: React.Dispatch<React.SetStateAction<ResumeContent>>
) {
  setContent((current) => ({
    ...current,
    experience: current.experience.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)),
  }));
}

function updateExperienceDates(index: number, value: string, setContent: React.Dispatch<React.SetStateAction<ResumeContent>>) {
  const [startDate = "", endDate = ""] = value.split(" - ");
  setContent((current) => ({
    ...current,
    experience: current.experience.map((item, itemIndex) => (itemIndex === index ? { ...item, startDate, endDate } : item)),
  }));
}

function updateEducation(
  index: number,
  field: "institution" | "degree" | "field",
  value: string,
  setContent: React.Dispatch<React.SetStateAction<ResumeContent>>
) {
  setContent((current) => ({
    ...current,
    education: current.education.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)),
  }));
}

function updateEducationDates(index: number, value: string, setContent: React.Dispatch<React.SetStateAction<ResumeContent>>) {
  const [startDate = "", endDate = ""] = value.split(" - ");
  setContent((current) => ({
    ...current,
    education: current.education.map((item, itemIndex) => (itemIndex === index ? { ...item, startDate, endDate } : item)),
  }));
}
