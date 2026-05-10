import { Resend } from "resend";

import { env } from "@/env";
import { inngest } from "@/lib/inngest";
import { prisma } from "@/lib/prisma";

export const sendNotificationDigests = inngest.createFunction(
  { id: "send-notification-digests", triggers: [{ cron: "30 2 * * *" }] },
  async () => {
    const preferences = await prisma.notificationPreference.findMany({
      where: {
        email: true,
        digest: true,
      },
      take: 200,
    });

    if (!env.AUTH_RESEND_KEY) {
      return {
        skipped: true,
        reason: "Resend is not configured",
        preferences: preferences.length,
      };
    }

    const resend = new Resend(env.AUTH_RESEND_KEY);
    let sent = 0;

    for (const preference of preferences) {
      const [user, notifications] = await Promise.all([
        prisma.user.findUnique({
          where: { id: preference.userId },
          select: { email: true, firstName: true },
        }),
        prisma.notification.findMany({
          where: {
            userId: preference.userId,
            isRead: false,
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        }),
      ]);

      if (!user?.email || notifications.length === 0) {
        continue;
      }

      const lines = notifications.map((notification) => `- ${notification.title}: ${notification.message}`).join("\n");

      await resend.emails.send({
        from: env.RESEND_FROM_EMAIL ?? "Career Studio <hello@careerstudio.lk>",
        to: user.email,
        subject: "Your Career Studio notification digest",
        text: `Hi ${user.firstName || "there"},\n\nHere are your unread Career Studio notifications:\n\n${lines}\n\nOpen Career Studio to review them.`,
      });
      sent += 1;
    }

    return { sent };
  }
);
