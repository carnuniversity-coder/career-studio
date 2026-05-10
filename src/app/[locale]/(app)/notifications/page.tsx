import type { Metadata } from "next";
import { Bell, CheckCheck, Mail } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { defaultLocale, isLocale } from "@/i18n-config";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
  updateNotificationPreferencesAction,
} from "@/server/actions/notifications/notifications";

type NotificationsPageProps = {
  params: Promise<{ locale: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: NotificationsPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = await getTranslations({ locale, namespace: "phase5.meta.notifications" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function NotificationsPage({ params }: NotificationsPageProps) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = await getTranslations({ locale, namespace: "phase5.notifications" });
  const session = await auth();
  const currentUserId = session?.user?.id ?? "";
  const [notifications, preferences] = currentUserId
    ? await Promise.all([
        prisma.notification.findMany({
          where: { userId: currentUserId },
          orderBy: { createdAt: "desc" },
          take: 60,
        }),
        prisma.notificationPreference.findUnique({
          where: { userId: currentUserId },
        }),
      ])
    : [[], null];
  const unread = notifications.filter((notification) => !notification.isRead).length;
  const markAllAction = markAllNotificationsReadAction.bind(null, locale);
  const preferencesAction = updateNotificationPreferencesAction.bind(null, locale);
  const preferenceFields = [
    { name: "email", label: t("emailNotifications"), checked: preferences?.email ?? true },
    { name: "inApp", label: t("inAppNotifications"), checked: preferences?.inApp ?? true },
    { name: "digest", label: t("dailyDigest"), checked: preferences?.digest ?? false },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">{t("title")}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-600">{t("subtitle")}</p>
        </div>
        <Badge variant="outline" className="w-fit rounded-md border-teal-200 text-teal-700">
          {unread} {t("unread")}
        </Badge>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2">
              <Bell className="size-5 text-teal-700" />
              {t("activity")}
            </CardTitle>
            <form action={markAllAction}>
              <Button type="submit" variant="outline" size="sm">
                <CheckCheck className="size-4" />
                {t("markAllRead")}
              </Button>
            </form>
          </CardHeader>
          <CardContent className="space-y-3">
            {notifications.map((notification) => (
              <article key={notification.id} className={`rounded-md border p-4 ${notification.isRead ? "bg-white" : "bg-teal-50"}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-neutral-950">{notification.title}</h2>
                      <Badge variant="outline" className="rounded-md">{notification.type}</Badge>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-neutral-600">{notification.message}</p>
                    {notification.actionUrl ? (
                      <a href={notification.actionUrl} className="mt-2 inline-block text-sm font-medium text-teal-700 hover:text-teal-800">
                        {t("open")}
                      </a>
                    ) : null}
                  </div>
                  {!notification.isRead ? (
                    <form action={markNotificationReadAction.bind(null, locale, notification.id)}>
                      <Button type="submit" variant="outline" size="sm">{t("markRead")}</Button>
                    </form>
                  ) : null}
                </div>
              </article>
            ))}
            {notifications.length === 0 ? <p className="text-sm text-neutral-500">{t("empty")}</p> : null}
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="size-5 text-teal-700" />
              {t("preferences")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={preferencesAction} className="space-y-3 text-sm">
              {preferenceFields.map((field) => (
                <label key={field.name} className="flex items-center justify-between rounded-md border bg-neutral-50 p-3">
                  <span>{field.label}</span>
                  <input name={field.name} type="checkbox" defaultChecked={field.checked} className="size-4 accent-teal-700" />
                </label>
              ))}
              <Button type="submit" className="bg-teal-700 text-white hover:bg-teal-800">{t("savePreferences")}</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
