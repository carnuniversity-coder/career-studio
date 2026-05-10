import type { Metadata } from "next";
import { MentorshipRequestStatus } from "@prisma/client";
import { CalendarClock, GraduationCap, Handshake } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { defaultLocale, isLocale } from "@/i18n-config";
import { auth } from "@/lib/auth";
import { dateTimeLocalValue, displayName } from "@/lib/community";
import { prisma } from "@/lib/prisma";
import {
  requestMentorshipAction,
  respondMentorshipRequestAction,
  saveMentorProfileAction,
  scheduleMentorshipSessionAction,
} from "@/server/actions/mentorship/mentorship";

type MentorshipPageProps = {
  params: Promise<{ locale: string }>;
};

export const dynamic = "force-dynamic";

function jsonStringList(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function availabilityNotes(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return "";
  }

  const record = value as Record<string, unknown>;

  return typeof record.notes === "string" ? record.notes : "";
}

export async function generateMetadata({ params }: MentorshipPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = await getTranslations({ locale, namespace: "phase5.meta.mentorship" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function MentorshipPage({ params }: MentorshipPageProps) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = await getTranslations({ locale, namespace: "phase5.mentorship" });
  const session = await auth();
  const currentUserId = session?.user?.id ?? "";
  const saveProfileAction = saveMentorProfileAction.bind(null, locale);
  const requestAction = requestMentorshipAction.bind(null, locale);
  const scheduleAction = scheduleMentorshipSessionAction.bind(null, locale);
  const now = new Date();
  const defaultStart = dateTimeLocalValue(new Date(now.getTime() + 24 * 60 * 60 * 1000));
  const defaultEnd = dateTimeLocalValue(new Date(now.getTime() + 25 * 60 * 60 * 1000));

  const [myProfile, mentorProfiles, outgoingRequests] = currentUserId
    ? await Promise.all([
        prisma.mentorProfile.findUnique({ where: { userId: currentUserId } }),
        prisma.mentorProfile.findMany({
          where: { isActive: true },
          orderBy: { updatedAt: "desc" },
          take: 24,
        }),
        prisma.mentorshipRequest.findMany({
          where: { menteeId: currentUserId },
          orderBy: { createdAt: "desc" },
        }),
      ])
    : [null, [], []];
  const incomingRequests = myProfile
    ? await prisma.mentorshipRequest.findMany({
        where: { mentorId: myProfile.id },
        orderBy: { createdAt: "desc" },
      })
    : [];
  const requestIds = [...incomingRequests, ...outgoingRequests].map((request) => request.id);
  const [sessions, users] = await Promise.all([
    requestIds.length
      ? prisma.mentorshipSession.findMany({
          where: { requestId: { in: requestIds } },
          orderBy: { startTime: "asc" },
        })
      : [],
    prisma.user.findMany({
      where: {
        id: {
          in: Array.from(
            new Set([
              ...mentorProfiles.map((profile) => profile.userId),
              ...incomingRequests.map((request) => request.menteeId),
              ...outgoingRequests.map((request) => request.menteeId),
            ])
          ),
        },
      },
      select: { id: true, firstName: true, lastName: true, email: true },
    }),
  ]);
  const userMap = new Map(users.map((user) => [user.id, user]));
  const outgoingMentorIds = new Set(outgoingRequests.map((request) => request.mentorId));
  const visibleMentors = mentorProfiles.filter((profile) => profile.userId !== currentUserId);
  const acceptedIncoming = incomingRequests.filter((request) => request.status === MentorshipRequestStatus.accepted);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">{t("title")}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-600">{t("subtitle")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={GraduationCap} label={t("mentors")} value={visibleMentors.length} />
        <StatCard icon={Handshake} label={t("requests")} value={incomingRequests.length + outgoingRequests.length} />
        <StatCard icon={CalendarClock} label={t("sessions")} value={sessions.length} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>{t("mentorDirectory")}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {visibleMentors.map((mentor) => {
                const expertise = jsonStringList(mentor.expertise);
                const alreadyRequested = outgoingMentorIds.has(mentor.id);

                return (
                  <article key={mentor.id} className="rounded-md border bg-neutral-50 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="font-semibold text-neutral-950">{displayName(userMap.get(mentor.userId) ?? {})}</h2>
                        <p className="mt-2 text-sm leading-6 text-neutral-600">{mentor.bio}</p>
                      </div>
                      <Badge variant="outline" className="rounded-md">Rs. {mentor.hourlyRate.toString()}</Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {expertise.slice(0, 5).map((skill) => (
                        <Badge key={skill} variant="outline" className="rounded-md">{skill}</Badge>
                      ))}
                    </div>
                    {alreadyRequested ? (
                      <Badge className="mt-4 rounded-md bg-amber-600">{t("requested")}</Badge>
                    ) : (
                      <form action={requestAction} className="mt-4 space-y-3">
                        <input type="hidden" name="mentorId" value={mentor.id} />
                        <Textarea name="message" placeholder={t("requestPlaceholder")} required />
                        <Button type="submit" size="sm" className="bg-teal-700 text-white hover:bg-teal-800">
                          {t("requestMentorship")}
                        </Button>
                      </form>
                    )}
                  </article>
                );
              })}
              {visibleMentors.length === 0 ? <p className="text-sm text-neutral-500">{t("emptyMentors")}</p> : null}
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle>{t("sessionsTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {sessions.map((sessionItem) => (
                <div key={sessionItem.id} className="rounded-md border bg-neutral-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="font-semibold text-neutral-950">{sessionItem.title}</div>
                    <Badge variant="outline" className="rounded-md">{sessionItem.status}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-neutral-600">
                    {sessionItem.startTime.toLocaleString("en-LK")} - {sessionItem.endTime.toLocaleTimeString("en-LK")}
                  </p>
                  {sessionItem.meetingLink ? (
                    <a href={sessionItem.meetingLink} className="mt-2 inline-block text-sm font-medium text-teal-700 hover:text-teal-800">
                      {t("meetingLink")}
                    </a>
                  ) : null}
                </div>
              ))}
              {sessions.length === 0 ? <p className="text-sm text-neutral-500">{t("emptySessions")}</p> : null}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>{t("mentorProfile")}</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={saveProfileAction} className="space-y-3">
                <Textarea name="bio" defaultValue={myProfile?.bio ?? ""} placeholder={t("bioPlaceholder")} required />
                <Input name="expertise" defaultValue={jsonStringList(myProfile?.expertise).join(", ")} placeholder={t("expertisePlaceholder")} required />
                <Input name="hourlyRate" type="number" min="0" defaultValue={myProfile?.hourlyRate.toString() ?? "0"} placeholder={t("hourlyRate")} />
                <Input name="maxMentees" type="number" min="1" defaultValue={myProfile?.maxMentees ?? 3} placeholder={t("maxMentees")} />
                <Textarea name="availability" defaultValue={availabilityNotes(myProfile?.availability)} placeholder={t("availabilityPlaceholder")} />
                <label className="flex items-center justify-between rounded-md border bg-neutral-50 p-3 text-sm">
                  <span>{t("activeMentor")}</span>
                  <input name="isActive" type="checkbox" defaultChecked={myProfile?.isActive ?? true} className="size-4 accent-teal-700" />
                </label>
                <Button type="submit" className="bg-teal-700 text-white hover:bg-teal-800">{t("saveProfile")}</Button>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle>{t("incomingRequests")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {incomingRequests.map((request) => (
                <div key={request.id} className="rounded-md border bg-neutral-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="font-semibold text-neutral-950">{displayName(userMap.get(request.menteeId) ?? {})}</div>
                    <Badge variant="outline" className="rounded-md">{request.status}</Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">{request.message}</p>
                  {request.status === MentorshipRequestStatus.pending ? (
                    <div className="mt-3 flex gap-2">
                      <form action={respondMentorshipRequestAction.bind(null, locale, request.id, MentorshipRequestStatus.accepted)}>
                        <Button type="submit" size="sm" className="bg-teal-700 text-white hover:bg-teal-800">{t("accept")}</Button>
                      </form>
                      <form action={respondMentorshipRequestAction.bind(null, locale, request.id, MentorshipRequestStatus.declined)}>
                        <Button type="submit" size="sm" variant="outline">{t("decline")}</Button>
                      </form>
                    </div>
                  ) : null}
                </div>
              ))}
              {incomingRequests.length === 0 ? <p className="text-sm text-neutral-500">{t("emptyIncoming")}</p> : null}
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle>{t("scheduleSession")}</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={scheduleAction} className="space-y-3">
                <select name="requestId" className="h-9 w-full rounded-md border bg-white px-3 text-sm">
                  {acceptedIncoming.map((request) => (
                    <option key={request.id} value={request.id}>{displayName(userMap.get(request.menteeId) ?? {})}</option>
                  ))}
                </select>
                <Input name="title" placeholder={t("sessionTitle")} />
                <Input name="startTime" type="datetime-local" defaultValue={defaultStart} />
                <Input name="endTime" type="datetime-local" defaultValue={defaultEnd} />
                <Input name="meetingLink" placeholder={t("meetingLinkPlaceholder")} />
                <Textarea name="notes" placeholder={t("sessionNotes")} />
                <Button type="submit" className="bg-teal-700 text-white hover:bg-teal-800" disabled={acceptedIncoming.length === 0}>
                  {t("schedule")}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: typeof GraduationCap; label: string; value: number }) {
  return (
    <Card className="bg-white">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex size-11 items-center justify-center rounded-md bg-teal-100 text-teal-800">
          <Icon className="size-5" />
        </div>
        <div>
          <div className="text-2xl font-semibold text-neutral-950">{value}</div>
          <div className="text-sm text-neutral-500">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}
