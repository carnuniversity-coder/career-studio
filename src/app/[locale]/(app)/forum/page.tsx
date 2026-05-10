import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquareReply, Pin, TrendingUp } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { defaultLocale, isLocale } from "@/i18n-config";
import { displayName } from "@/lib/community";
import { prisma } from "@/lib/prisma";
import { createThreadAction } from "@/server/actions/forum/forum";
import { ensureDefaultForumRoles } from "@/server/services/forum/forum-service";

type ForumPageProps = {
  params: Promise<{ locale: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: ForumPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = await getTranslations({ locale, namespace: "phase5.meta.forum" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function ForumPage({ params }: ForumPageProps) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = await getTranslations({ locale, namespace: "phase5.forum" });
  const roles = await ensureDefaultForumRoles();
  const createAction = createThreadAction.bind(null, locale);
  const threads = await prisma.forumThread.findMany({
    orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
    take: 40,
  });
  const authorIds = Array.from(new Set(threads.map((thread) => thread.authorId)));
  const [replyCounts, authors] = await Promise.all([
    prisma.forumReply.groupBy({
      by: ["threadId"],
      _count: { threadId: true },
    }),
    prisma.user.findMany({
      where: {
        id: {
          in: authorIds,
        },
      },
      select: { id: true, firstName: true, lastName: true, email: true },
    }),
  ]);
  const roleMap = new Map(roles.map((role) => [role.id, role]));
  const authorMap = new Map(authors.map((author) => [author.id, author]));
  const replyCountMap = new Map(replyCounts.map((item) => [item.threadId, item._count.threadId]));
  const trendingThreads = [...threads]
    .sort((left, right) => right.voteCount + (replyCountMap.get(right.id) ?? 0) - (left.voteCount + (replyCountMap.get(left.id) ?? 0)))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">{t("title")}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-600">{t("subtitle")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {roles.map((role) => (
          <Card key={role.id} className="bg-white">
            <CardContent className="p-4">
              <div className="font-semibold text-neutral-950">{role.name}</div>
              <p className="mt-2 text-sm leading-6 text-neutral-600">{role.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>{t("createThread")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createAction} className="space-y-4">
              <select name="roleId" className="h-9 w-full rounded-md border bg-white px-3 text-sm">
                <option value="">{t("generalDiscussion")}</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
              <Input name="title" placeholder={t("threadTitle")} required />
              <Textarea name="body" placeholder={t("threadBody")} required />
              <Button type="submit" className="bg-teal-700 text-white hover:bg-teal-800">
                {t("publishThread")}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="size-5 text-teal-700" />
                {t("trending")}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {trendingThreads.map((thread) => (
                <ThreadCard
                  key={thread.id}
                  locale={locale}
                  title={thread.title}
                  id={thread.id}
                  isPinned={thread.isPinned}
                  roleName={thread.roleId ? roleMap.get(thread.roleId)?.name : t("generalDiscussion")}
                  authorName={displayName(authorMap.get(thread.authorId) ?? {})}
                  replies={replyCountMap.get(thread.id) ?? 0}
                  votes={thread.voteCount}
                  pinnedLabel={t("pinned")}
                  votesLabel={t("votes")}
                />
              ))}
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle>{t("latestThreads")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {threads.map((thread) => (
                <ThreadCard
                  key={thread.id}
                  locale={locale}
                  title={thread.title}
                  id={thread.id}
                  isPinned={thread.isPinned}
                  roleName={thread.roleId ? roleMap.get(thread.roleId)?.name : t("generalDiscussion")}
                  authorName={displayName(authorMap.get(thread.authorId) ?? {})}
                  replies={replyCountMap.get(thread.id) ?? 0}
                  votes={thread.voteCount}
                  pinnedLabel={t("pinned")}
                  votesLabel={t("votes")}
                />
              ))}
              {threads.length === 0 ? <p className="text-sm text-neutral-500">{t("emptyThreads")}</p> : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ThreadCard({
  locale,
  id,
  title,
  roleName,
  authorName,
  replies,
  votes,
  isPinned,
  pinnedLabel,
  votesLabel,
}: {
  locale: string;
  id: string;
  title: string;
  roleName?: string;
  authorName: string;
  replies: number;
  votes: number;
  isPinned: boolean;
  pinnedLabel: string;
  votesLabel: string;
}) {
  return (
    <Link href={`/${locale}/forum/${id}`} className="block rounded-md border bg-neutral-50 p-4 transition hover:bg-neutral-100">
      <div className="flex flex-wrap items-center gap-2">
        {isPinned ? (
          <Badge className="rounded-md bg-amber-600">
            <Pin className="size-3" />
            {pinnedLabel}
          </Badge>
        ) : null}
        {roleName ? <Badge variant="outline" className="rounded-md">{roleName}</Badge> : null}
      </div>
      <h2 className="mt-3 font-semibold text-neutral-950">{title}</h2>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-neutral-500">
        <span>{authorName}</span>
        <span>{votes} {votesLabel}</span>
        <span className="inline-flex items-center gap-1">
          <MessageSquareReply className="size-3.5" />
          {replies}
        </span>
      </div>
    </Link>
  );
}
