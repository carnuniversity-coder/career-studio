"use server";

import { ConnectionRequestStatus, NotificationType } from "@prisma/client";
import { redirect } from "next/navigation";
import { z } from "zod";

import type { Locale } from "@/i18n-config";
import { displayName, sortUserPair } from "@/lib/community";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/server/services/notifications/notification-service";
import { authPath, formValue, requireUser } from "@/server/utils/action-helpers";

const requestSchema = z.object({
  receiverId: z.string().uuid(),
  message: z.string().trim().max(1000).default(""),
});

const responseSchema = z.object({
  requestId: z.string().uuid(),
  decision: z.enum(["accepted", "declined"]),
});

const endorsementSchema = z.object({
  userId: z.string().uuid(),
  skill: z.string().trim().min(2).max(80),
});

const privacySchema = z.object({
  showEmail: z.boolean(),
  showPhone: z.boolean(),
  allowMessages: z.boolean(),
  allowConnections: z.boolean(),
});

async function areConnected(userAId: string, userBId: string) {
  const [firstId, secondId] = sortUserPair(userAId, userBId);
  const connection = await prisma.connection.findUnique({
    where: {
      userAId_userBId: {
        userAId: firstId,
        userBId: secondId,
      },
    },
    select: { id: true },
  });

  return Boolean(connection);
}

export async function sendConnectionRequestAction(locale: Locale, formData: FormData) {
  const user = await requireUser(locale);
  const parsed = requestSchema.parse({
    receiverId: formValue(formData, "receiverId"),
    message: formValue(formData, "message"),
  });

  if (user.id === parsed.receiverId) {
    throw new Error("Cannot connect with yourself");
  }

  const [receiver, privacy, blocked, existingReverse] = await Promise.all([
    prisma.user.findUnique({
      where: { id: parsed.receiverId },
      select: { id: true, firstName: true, lastName: true, email: true },
    }),
    prisma.userPrivacySettings.findUnique({
      where: { userId: parsed.receiverId },
      select: { allowConnections: true },
    }),
    prisma.userBlock.findFirst({
      where: {
        OR: [
          { blockerId: user.id, blockedId: parsed.receiverId },
          { blockerId: parsed.receiverId, blockedId: user.id },
        ],
      },
    }),
    prisma.connectionRequest.findFirst({
      where: {
        requesterId: parsed.receiverId,
        receiverId: user.id,
        status: ConnectionRequestStatus.pending,
      },
    }),
  ]);

  if (!receiver || blocked || privacy?.allowConnections === false || (await areConnected(user.id, parsed.receiverId))) {
    throw new Error("Connection is not available");
  }

  if (existingReverse) {
    await respondConnectionRequestAction(locale, existingReverse.id, ConnectionRequestStatus.accepted);
    return;
  }

  await prisma.connectionRequest.upsert({
    where: {
      requesterId_receiverId: {
        requesterId: user.id,
        receiverId: parsed.receiverId,
      },
    },
    create: {
      requesterId: user.id,
      receiverId: parsed.receiverId,
      message: parsed.message,
    },
    update: {
      message: parsed.message,
      status: ConnectionRequestStatus.pending,
    },
  });

  const sender = await prisma.user.findUnique({
    where: { id: user.id },
    select: { firstName: true, lastName: true, email: true },
  });

  await createNotification({
    userId: parsed.receiverId,
    type: NotificationType.system,
    title: "Connection request",
    message: `${displayName(sender ?? {})} wants to connect with you.`,
    actionUrl: `/${locale}/connections`,
  });

  redirect(authPath(locale, "/connections"));
}

export async function respondConnectionRequestAction(locale: Locale, requestId: string, decision: "accepted" | "declined") {
  const user = await requireUser(locale);
  const parsed = responseSchema.parse({ requestId, decision });
  const request = await prisma.connectionRequest.findFirst({
    where: {
      id: parsed.requestId,
      receiverId: user.id,
      status: ConnectionRequestStatus.pending,
    },
  });

  if (!request) {
    throw new Error("Connection request not found");
  }

  await prisma.connectionRequest.update({
    where: { id: request.id },
    data: { status: parsed.decision },
  });

  if (parsed.decision === "accepted") {
    const [firstId, secondId] = sortUserPair(request.requesterId, request.receiverId);

    await prisma.connection.upsert({
      where: {
        userAId_userBId: {
          userAId: firstId,
          userBId: secondId,
        },
      },
      create: {
        userAId: firstId,
        userBId: secondId,
      },
      update: {},
    });

    const receiver = await prisma.user.findUnique({
      where: { id: user.id },
      select: { firstName: true, lastName: true, email: true },
    });

    await createNotification({
      userId: request.requesterId,
      type: NotificationType.system,
      title: "Connection accepted",
      message: `${displayName(receiver ?? {})} accepted your connection request.`,
      actionUrl: `/${locale}/connections`,
    });
  }

  redirect(authPath(locale, "/connections"));
}

export async function endorseConnectionAction(locale: Locale, formData: FormData) {
  const user = await requireUser(locale);
  const parsed = endorsementSchema.parse({
    userId: formValue(formData, "userId"),
    skill: formValue(formData, "skill"),
  });

  if (!(await areConnected(user.id, parsed.userId))) {
    throw new Error("You can only endorse connections");
  }

  const existing = await prisma.endorsement.findFirst({
    where: {
      endorserId: user.id,
      userId: parsed.userId,
      skill: parsed.skill,
    },
  });

  if (!existing) {
    await prisma.endorsement.create({
      data: {
        endorserId: user.id,
        userId: parsed.userId,
        skill: parsed.skill,
      },
    });
  }

  const sender = await prisma.user.findUnique({
    where: { id: user.id },
    select: { firstName: true, lastName: true, email: true },
  });

  await createNotification({
    userId: parsed.userId,
    type: NotificationType.system,
    title: "New endorsement",
    message: `${displayName(sender ?? {})} endorsed you for ${parsed.skill}.`,
    actionUrl: `/${locale}/connections`,
  });

  redirect(authPath(locale, "/connections"));
}

export async function updatePrivacySettingsAction(locale: Locale, formData: FormData) {
  const user = await requireUser(locale);
  const parsed = privacySchema.parse({
    showEmail: formValue(formData, "showEmail") === "on",
    showPhone: formValue(formData, "showPhone") === "on",
    allowMessages: formValue(formData, "allowMessages") === "on",
    allowConnections: formValue(formData, "allowConnections") === "on",
  });

  await prisma.userPrivacySettings.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      ...parsed,
    },
    update: parsed,
  });

  redirect(authPath(locale, "/connections"));
}
