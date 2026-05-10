"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import type { Locale } from "@/i18n-config";
import { prisma } from "@/lib/prisma";
import { authPath, formValue, requireUser } from "@/server/utils/action-helpers";

const notificationIdSchema = z.string().uuid();

const preferencesSchema = z.object({
  email: z.boolean(),
  inApp: z.boolean(),
  digest: z.boolean(),
});

export async function markNotificationReadAction(locale: Locale, notificationId: string) {
  const user = await requireUser(locale);
  const parsedId = notificationIdSchema.parse(notificationId);

  await prisma.notification.updateMany({
    where: {
      id: parsedId,
      userId: user.id,
    },
    data: {
      isRead: true,
    },
  });

  redirect(authPath(locale, "/notifications"));
}

export async function markAllNotificationsReadAction(locale: Locale) {
  const user = await requireUser(locale);

  await prisma.notification.updateMany({
    where: {
      userId: user.id,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });

  redirect(authPath(locale, "/notifications"));
}

export async function updateNotificationPreferencesAction(locale: Locale, formData: FormData) {
  const user = await requireUser(locale);
  const parsed = preferencesSchema.parse({
    email: formValue(formData, "email") === "on",
    inApp: formValue(formData, "inApp") === "on",
    digest: formValue(formData, "digest") === "on",
  });

  await prisma.notificationPreference.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      email: parsed.email,
      inApp: parsed.inApp,
      digest: parsed.digest,
    },
    update: parsed,
  });

  redirect(authPath(locale, "/notifications"));
}
