import type { Metadata } from "next";
import Link from "next/link";
import { ForumVoteType } from "@prisma/client";
import { ArrowBigDown, ArrowBigUp, Flag, MessageSquareReply } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { defaultLocale, isLocale } from "@/i18n-config";
import { displayName } from "@/lib/community";
import { prisma } from "@/lib/prisma";
import { createReplyAction, flagThreadAction, voteThreadAction } from "@/server/actions/forum/forum";

type ForumThreadPageProps = {
  params: Promise<{ locale: string; threadId: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: ForumThreadPageProps): Promise<Metadata> {
  const { locale: rawLocale, threadId } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const thread = await prisma.forumThread.findUnique({
    where: { id: threadId },
    select: { title: true, body: true },
  });
  const t = await getTranslations({ locale, namespace: "phase5.meta.forumThread" });

  return {
    title: thread ? `${thread.title} - Career Studio Forum` : t("title"),
    description: thread?.body.slice(0, 150) ?? t("description"),
  };
}

export default async function ForumThreadPage({ params }: ForumThreadPageProps) {
  const { locale: rawLocale, threadId } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = await getTranslations({ locale, namespace: "phase5.forumThread" });
  const thread = await prisma.forumThread.findUnique({ where: { id: threadId } });

  if (!thread) {
    notFound();
  }

  const [role, replies] = await Promise.all([
    thread.roleId ? prisma.forumRole.findUnique({ where: { id: thread.roleId } }) : null,
    prisma.forumReply.findMany({
      where: { threadId: thread.id },
      orderBy: { createdAt: "asc" },
    }),
  ]);
  const authorIds = Array.from(new Set([thread.authorId, ...replies.map((reply) => reply.authorId)]));
  const authors = await prisma.user.findMany({
    where: { id: { in: authorIds } },
    select: { id: true, firstName: true, lastName: true, email: true },
  });
  const authorMap = new Map(authors.map((author) => [author.id, author]));
  const replyAction = createReplyAction.bind(null, locale, thread.id);
  const upvoteAction = voteThreadAction.bind(null, locale, thread.id, ForumVoteType.up);
  const downvoteAction = voteThreadAction.bind(null, locale, thread.id, ForumVoteType.down);
  const flagAction = flagThreadAction.bind(null, locale, thread.id);

  return (
    <div className="space-y-6">
      <Link href={`/${locale}/forum`} className="text-sm font-medium text-teal-700 hover:text-teal-800">
        {t("back")}
      </Link>

      <Card className="bg-white">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            {role ? <Badge variant="outline" className="rounded-md">{role.name}</Badge> : null}
            {thread.isLocked ? <Badge className="rounded-md bg-amber-600">{t("locked")}</Badge> : null}
          </div>
          <CardTitle className="text-2xl">{thread.title}</CardTitle>
          <p className="text-sm text-neutral-500">{displayName(authorMap.get(thread.authorId) ?? {})}</p>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="whitespace-pre-wrap text-sm leading-6 text-neutral-700">{thread.body}</p>
          <div className="flex flex-wrap items-center gap-2">
            <form action={upvoteAction}>
              <Button type="submit" variant="outline" size="sm">
                <ArrowBigUp className="size-4" />
                {t("upvote")}
              </Button>
            </form>
            <form action={downvoteAction}>
              <Button type="submit" variant="outline" size="sm">
                <ArrowBigDown className="size-4" />
                {t("downvote")}
              </Button>
            </form>
            <Badge variant="outline" className="rounded-md">{thread.voteCount} {t("votes")}</Badge>
          </div>
          <form action={flagAction} className="flex gap-2">
            <Input name="reason" placeholder={t("flagReason")} />
            <Button type="submit" variant="outline">
              <Flag className="size-4" />
              {t("flag")}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquareReply className="size-5 text-teal-700" />
            {t("replies")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {replies.map((reply) => (
            <article key={reply.id} className="rounded-md border bg-neutral-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="font-medium text-neutral-950">{displayName(authorMap.get(reply.authorId) ?? {})}</div>
                <Badge variant="outline" className="rounded-md">{reply.voteCount} {t("votes")}</Badge>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-neutral-700">{reply.body}</p>
            </article>
          ))}
          {replies.length === 0 ? <p className="text-sm text-neutral-500">{t("emptyReplies")}</p> : null}

          {!thread.isLocked ? (
            <form action={replyAction} className="space-y-3 rounded-md border bg-neutral-50 p-4">
              <Textarea name="body" placeholder={t("replyPlaceholder")} required />
              <Button type="submit" className="bg-teal-700 text-white hover:bg-teal-800">
                {t("postReply")}
              </Button>
            </form>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
