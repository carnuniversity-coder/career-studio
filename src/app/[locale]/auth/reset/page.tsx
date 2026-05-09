import type { Metadata } from "next";
import Link from "next/link";
import { Mail } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { AuthShell } from "@/components/auth/auth-shell";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { defaultLocale, isLocale } from "@/i18n-config";
import { requestRecoveryLink } from "@/server/actions/accounts";

type AuthPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = await getTranslations({ locale, namespace: "phase2.meta.reset" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function ResetPage({ params, searchParams }: AuthPageProps) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const query = await searchParams;
  const t = await getTranslations({ locale, namespace: "phase2.auth" });
  const error = firstParam(query.error);
  const errorKey = ["invalid-email"].includes(error) ? error : "default";
  const resetAction = requestRecoveryLink.bind(null, locale);

  return (
    <AuthShell
      locale={locale}
      brand={t("brand")}
      title={t("resetShellTitle")}
      subtitle={t("resetShellSubtitle")}
      featureTitleOne={t("featurePrivateTitle")}
      featureBodyOne={t("featurePrivateBody")}
      featureTitleTwo={t("featureAtsTitle")}
      featureBodyTwo={t("featureAtsBody")}
      featureTitleThree={t("featureSetupTitle")}
      featureBodyThree={t("featureSetupBody")}
    >
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-2xl">{t("resetTitle")}</CardTitle>
          <p className="text-sm leading-6 text-neutral-600">{t("resetSubtitle")}</p>
        </CardHeader>
        <CardContent className="space-y-5">
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{t(`errors.${errorKey}`)}</AlertDescription>
            </Alert>
          ) : null}
          <form action={resetAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("emailLabel")}</Label>
              <Input id="email" name="email" type="email" placeholder={t("emailPlaceholder")} required />
            </div>
            <Button type="submit" className="w-full bg-teal-700 text-white hover:bg-teal-800">
              <Mail className="size-4" />
              {t("sendRecoveryLink")}
            </Button>
          </form>
          <p className="text-center text-sm text-neutral-600">
            <Link href={`/${locale}/auth/sign-in`} className="font-medium text-teal-800 hover:underline">
              {t("backToSignIn")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
