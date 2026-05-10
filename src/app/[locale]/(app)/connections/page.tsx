import type { Metadata } from "next";
import { ConnectionRequestStatus } from "@prisma/client";
import { BadgeCheck, Handshake, Search, Shield } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { defaultLocale, isLocale } from "@/i18n-config";
import { auth } from "@/lib/auth";
import { displayName } from "@/lib/community";
import { prisma } from "@/lib/prisma";
import {
  endorseConnectionAction,
  respondConnectionRequestAction,
  sendConnectionRequestAction,
  updatePrivacySettingsAction,
} from "@/server/actions/connections/connections";

type ConnectionsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({ params }: ConnectionsPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = await getTranslations({ locale, namespace: "phase5.meta.connections" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function ConnectionsPage({ params, searchParams }: ConnectionsPageProps) {
  const { locale: rawLocale } = await params;
  const query = (await searchParams) ?? {};
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = await getTranslations({ locale, namespace: "phase5.connections" });
  const session = await auth();
  const currentUserId = session?.user?.id ?? "";
  const q = single(query.q) ?? "";
  const requestAction = sendConnectionRequestAction.bind(null, locale);
  const endorseAction = endorseConnectionAction.bind(null, locale);
  const privacyAction = updatePrivacySettingsAction.bind(null, locale);

  const [connections, incomingRequests, outgoingRequests, privacy, members] = currentUserId
    ? await Promise.all([
        prisma.connection.findMany({
          where: {
            OR: [{ userAId: currentUserId }, { userBId: currentUserId }],
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.connectionRequest.findMany({
          where: {
            receiverId: currentUserId,
            status: ConnectionRequestStatus.pending,
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.connectionRequest.findMany({
          where: {
            requesterId: currentUserId,
            status: ConnectionRequestStatus.pending,
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.userPrivacySettings.findUnique({
          where: { userId: currentUserId },
        }),
        prisma.user.findMany({
          where: {
            id: { not: currentUserId },
            isActive: true,
            ...(q
              ? {
                  OR: [
                    { firstName: { contains: q, mode: "insensitive" } },
                    { lastName: { contains: q, mode: "insensitive" } },
                    { email: { contains: q, mode: "insensitive" } },
                  ],
                }
              : {}),
          },
          orderBy: [{ firstName: "asc" }, { email: "asc" }],
          take: 24,
        }),
      ])
    : [[], [], [], null, []];

  const connectedIds = new Set(
    connections.map((connection) => (connection.userAId === currentUserId ? connection.userBId : connection.userAId))
  );
  const outgoingIds = new Set(outgoingRequests.map((request) => request.receiverId));
  const incomingIds = new Set(incomingRequests.map((request) => request.requesterId));
  const peopleIds = Array.from(
    new Set([
      ...connectedIds,
      ...outgoingRequests.map((request) => request.receiverId),
      ...incomingRequests.map((request) => request.requesterId),
      ...members.map((member) => member.id),
    ])
  );
  const [people, endorsements] = await Promise.all([
    peopleIds.length
      ? prisma.user.findMany({
          where: { id: { in: peopleIds } },
          select: { id: true, firstName: true, lastName: true, email: true, profile: true },
        })
      : [],
    connectedIds.size
      ? prisma.endorsement.findMany({
          where: {
            userId: {
              in: Array.from(connectedIds),
            },
          },
          orderBy: { createdAt: "desc" },
          take: 30,
        })
      : [],
  ]);
  const peopleMap = new Map(people.map((person) => [person.id, person]));
  const discoverableMembers = members.filter((member) => !connectedIds.has(member.id) && !outgoingIds.has(member.id) && !incomingIds.has(member.id));
  const privacyFields = [
    { name: "showEmail", label: t("showEmail"), checked: privacy?.showEmail ?? false },
    { name: "showPhone", label: t("showPhone"), checked: privacy?.showPhone ?? false },
    { name: "allowMessages", label: t("allowMessages"), checked: privacy?.allowMessages ?? true },
    { name: "allowConnections", label: t("allowConnections"), checked: privacy?.allowConnections ?? true },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">{t("title")}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-600">{t("subtitle")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={Handshake} label={t("connections")} value={connections.length} />
        <StatCard icon={BadgeCheck} label={t("incoming")} value={incomingRequests.length} />
        <StatCard icon={Shield} label={t("pending")} value={outgoingRequests.length} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>{t("discover")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-neutral-400" />
                  <Input name="q" defaultValue={q} placeholder={t("searchMembers")} className="pl-9" />
                </div>
                <Button type="submit" variant="outline">{t("search")}</Button>
              </form>
              <div className="grid gap-3 md:grid-cols-2">
                {discoverableMembers.map((member) => (
                  <form key={member.id} action={requestAction} className="rounded-md border bg-neutral-50 p-4">
                    <input type="hidden" name="receiverId" value={member.id} />
                    <div className="font-semibold text-neutral-950">{displayName(member)}</div>
                    <p className="mt-1 text-sm text-neutral-500">{member.email}</p>
                    <Textarea name="message" className="mt-3" placeholder={t("requestMessage")} />
                    <Button type="submit" size="sm" className="mt-3 bg-teal-700 text-white hover:bg-teal-800">
                      {t("connect")}
                    </Button>
                  </form>
                ))}
                {discoverableMembers.length === 0 ? <p className="text-sm text-neutral-500">{t("emptyDiscover")}</p> : null}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle>{t("myConnections")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from(connectedIds).map((connectionId) => {
                const person = peopleMap.get(connectionId);
                const personEndorsements = endorsements.filter((endorsement) => endorsement.userId === connectionId);

                return (
                  <div key={connectionId} className="rounded-md border bg-neutral-50 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-neutral-950">{displayName(person ?? {})}</div>
                        <p className="mt-1 text-sm text-neutral-500">{person?.email}</p>
                      </div>
                      <Badge variant="outline" className="rounded-md">{personEndorsements.length} {t("endorsements")}</Badge>
                    </div>
                    <form action={endorseAction} className="mt-3 flex gap-2">
                      <input type="hidden" name="userId" value={connectionId} />
                      <Input name="skill" placeholder={t("skillPlaceholder")} />
                      <Button type="submit" variant="outline">{t("endorse")}</Button>
                    </form>
                  </div>
                );
              })}
              {connectedIds.size === 0 ? <p className="text-sm text-neutral-500">{t("emptyConnections")}</p> : null}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>{t("incomingRequests")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {incomingRequests.map((request) => (
                <div key={request.id} className="rounded-md border bg-neutral-50 p-4">
                  <div className="font-semibold text-neutral-950">{displayName(peopleMap.get(request.requesterId) ?? {})}</div>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">{request.message || t("noMessage")}</p>
                  <div className="mt-3 flex gap-2">
                    <form action={respondConnectionRequestAction.bind(null, locale, request.id, ConnectionRequestStatus.accepted)}>
                      <Button type="submit" size="sm" className="bg-teal-700 text-white hover:bg-teal-800">{t("accept")}</Button>
                    </form>
                    <form action={respondConnectionRequestAction.bind(null, locale, request.id, ConnectionRequestStatus.declined)}>
                      <Button type="submit" size="sm" variant="outline">{t("decline")}</Button>
                    </form>
                  </div>
                </div>
              ))}
              {incomingRequests.length === 0 ? <p className="text-sm text-neutral-500">{t("emptyIncoming")}</p> : null}
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle>{t("privacy")}</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={privacyAction} className="space-y-3 text-sm">
                {privacyFields.map((field) => (
                  <label key={field.name} className="flex items-center justify-between rounded-md border bg-neutral-50 p-3">
                    <span>{field.label}</span>
                    <input name={field.name} type="checkbox" defaultChecked={field.checked} className="size-4 accent-teal-700" />
                  </label>
                ))}
                <Button type="submit" className="bg-teal-700 text-white hover:bg-teal-800">{t("savePrivacy")}</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: typeof Handshake; label: string; value: number }) {
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
