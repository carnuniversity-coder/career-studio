import type { NotificationType } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function createNotification(input: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
}) {
  const preference = await prisma.notificationPreference.findUnique({
    where: { userId: input.userId },
    select: { inApp: true },
  });

  if (preference?.inApp === false) {
    return null;
  }

  return prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      actionUrl: input.actionUrl ?? "",
    },
  });
}

export async function unreadNotificationCount(userId: string) {
  return prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });
}
