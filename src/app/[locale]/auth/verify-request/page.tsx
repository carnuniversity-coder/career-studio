import type { Metadata } from "next";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { defaultLocale, isLocale } from "@/i18n-config";

type VerifyRequestPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: VerifyRequestPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = await getTranslations({ locale, namespace: "phase2.meta.verifyRequest" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function VerifyRequestPage({ params }: VerifyRequestPageProps) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = await getTranslations({ locale, namespace: "phase2.auth" });

  return (
    <main className="flex min-h-screen items-center bg-gradient-to-br from-teal-50 via-white to-amber-50 px-4">
      <Card className="mx-auto max-w-md bg-white text-center">
        <CardHeader>
          <div className="mx-auto flex size-14 items-center justify-center rounded-md bg-teal-100 text-teal-800">
            <MailCheck className="size-7" />
          </div>
          <CardTitle className="mt-4 text-2xl">{t("verifyTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-neutral-600">{t("verifyBody")}</p>
          <Button asChild className="mt-6 bg-teal-700 text-white hover:bg-teal-800">
            <Link href={`/${locale}/auth/sign-in`}>{t("backToSignIn")}</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
