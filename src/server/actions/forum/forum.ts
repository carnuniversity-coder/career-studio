"use server";

import { ForumVoteType, NotificationType } from "@prisma/client";
import { redirect } from "next/navigation";
import { z } from "zod";

import type { Locale } from "@/i18n-config";
import { displayName, slugifyCommunityTitle } from "@/lib/community";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/server/services/notifications/notification-service";
import { authPath, formValue, requireUser } from "@/server/utils/action-helpers";

const createThreadSchema = z.object({
  roleId: z.string().uuid().optional().or(z.literal("")),
  title: z.string().trim().min(5).max(180),
  body: z.string().trim().min(20).max(10000),
});

const createReplySchema = z.object({
  body: z.string().trim().min(5).max(8000),
});

const voteSchema = z.object({
  id: z.string().uuid(),
  voteType: z.enum([ForumVoteType.up, ForumVoteType.down]),
});

const flagSchema = z.object({
  id: z.string().uuid(),
  reason: z.string().trim().min(5).max(500),
});

function voteValue(voteType: ForumVoteType) {
  return voteType === ForumVoteType.up ? 1 : -1;
}

export async function createThreadAction(locale: Locale, formData: FormData) {
  const user = await requireUser(locale);
  const parsed = createThreadSchema.parse({
    roleId: formValue(formData, "roleId"),
    title: formValue(formData, "title"),
    body: formValue(formData, "body"),
  });
  const roleId = parsed.roleId || null;
  const slug = `${slugifyCommunityTitle(parsed.title)}-${Date.now().toString(36)}`;

  if (roleId) {
    const role = await prisma.forumRole.findUnique({
      where: { id: roleId },
      select: { id: true },
    });

    if (!role) {
      throw new Error("Forum role not found");
    }

    await prisma.userRoleAssignment.upsert({
      where: {
        userId_roleId: {
          userId: user.id,
          roleId,
        },
      },
      create: {
        userId: user.id,
        roleId,
      },
      update: {},
    });
  }

  const thread = await prisma.forumThread.create({
    data: {
      roleId,
      authorId: user.id,
      title: parsed.title,
      slug,
      body: parsed.body,
    },
  });

  redirect(authPath(locale, `/forum/${thread.id}`));
}

export async function createReplyAction(locale: Locale, threadId: string, formData: FormData) {
  const user = await requireUser(locale);
  const parsed = createReplySchema.parse({
    body: formValue(formData, "body"),
  });
  const thread = await prisma.forumThread.findUnique({
    where: { id: threadId },
    select: { id: true, authorId: true, title: true, isLocked: true },
  });

  if (!thread || thread.isLocked) {
    throw new Error("Thread is not available");
  }

  await prisma.forumReply.create({
    data: {
      threadId: thread.id,
      authorId: user.id,
      body: parsed.body,
    },
  });

  if (thread.authorId !== user.id) {
    const sender = await prisma.user.findUnique({
      where: { id: user.id },
      select: { firstName: true, lastName: true, email: true },
    });

    await createNotification({
      userId: thread.authorId,
      type: NotificationType.forum_reply,
      title: "New forum reply",
      message: `${displayName(sender ?? {})} replied to "${thread.title}"`,
      actionUrl: `/${locale}/forum/${thread.id}`,
    });
  }

  redirect(authPath(locale, `/forum/${thread.id}`));
}

export async function voteThreadAction(locale: Locale, threadId: string, voteType: ForumVoteType) {
  const user = await requireUser(locale);
  const parsed = voteSchema.parse({ id: threadId, voteType });
  const existing = await prisma.forumVote.findFirst({
    where: {
      userId: user.id,
      threadId: parsed.id,
      replyId: null,
    },
  });

  const delta = existing ? voteValue(parsed.voteType) - voteValue(existing.voteType) : voteValue(parsed.voteType);

  if (existing) {
    await prisma.forumVote.update({
      where: { id: existing.id },
      data: { voteType: parsed.voteType },
    });
  } else {
    await prisma.forumVote.create({
      data: {
        userId: user.id,
        threadId: parsed.id,
        voteType: parsed.voteType,
      },
    });
  }

  if (delta !== 0) {
    await prisma.forumThread.update({
      where: { id: parsed.id },
      data: {
        voteCount: {
          increment: delta,
        },
      },
    });
  }

  redirect(authPath(locale, `/forum/${parsed.id}`));
}

export async function flagThreadAction(locale: Locale, threadId: string, formData: FormData) {
  const user = await requireUser(locale);
  const parsed = flagSchema.parse({
    id: threadId,
    reason: formValue(formData, "reason"),
  });

  await prisma.forumFlag.create({
    data: {
      userId: user.id,
      threadId: parsed.id,
      reason: parsed.reason,
    },
  });

  redirect(authPath(locale, `/forum/${parsed.id}`));
}
