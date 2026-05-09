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
import { requestEmailSignIn, signInWithGoogle } from "@/server/actions/accounts";

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
  const t = await getTranslations({ locale, namespace: "phase2.meta.signIn" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function SignInPage({ params, searchParams }: AuthPageProps) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const query = await searchParams;
  const t = await getTranslations({ locale, namespace: "phase2.auth" });
  const callbackUrl = firstParam(query.callbackUrl);
  const error = firstParam(query.error);
  const errorKey = ["invalid-email", "google-unconfigured"].includes(error) ? error : "default";
  const emailAction = requestEmailSignIn.bind(null, locale);
  const googleAction = signInWithGoogle.bind(null, locale);

  return (
    <AuthShell
      locale={locale}
      brand={t("brand")}
      title={t("signInShellTitle")}
      subtitle={t("signInShellSubtitle")}
      featureTitleOne={t("featureAiTitle")}
      featureBodyOne={t("featureAiBody")}
      featureTitleTwo={t("featureAtsTitle")}
      featureBodyTwo={t("featureAtsBody")}
      featureTitleThree={t("featureTemplatesTitle")}
      featureBodyThree={t("featureTemplatesBody")}
    >
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-2xl">{t("signInTitle")}</CardTitle>
          <p className="text-sm leading-6 text-neutral-600">{t("signInSubtitle")}</p>
        </CardHeader>
        <CardContent className="space-y-5">
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{t(`errors.${errorKey}`)}</AlertDescription>
            </Alert>
          ) : null}
          <form action={googleAction}>
            <input type="hidden" name="callbackUrl" value={callbackUrl} />
            <Button type="submit" variant="outline" className="w-full">
              <span className="font-semibold">G</span>
              {t("continueGoogle")}
            </Button>
          </form>
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-neutral-500">
            <span className="h-px flex-1 bg-neutral-200" />
            {t("or")}
            <span className="h-px flex-1 bg-neutral-200" />
          </div>
          <form action={emailAction} className="space-y-4">
            <input type="hidden" name="callbackUrl" value={callbackUrl} />
            <div className="space-y-2">
              <Label htmlFor="email">{t("emailLabel")}</Label>
              <Input id="email" name="email" type="email" placeholder={t("emailPlaceholder")} required />
            </div>
            <Button type="submit" className="w-full bg-teal-700 text-white hover:bg-teal-800">
              <Mail className="size-4" />
              {t("sendSignInLink")}
            </Button>
          </form>
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-neutral-600">
            <Link href={`/${locale}/auth/reset`} className="font-medium text-teal-800 hover:underline">
              {t("resetLink")}
            </Link>
            <span>
              {t("newHere")}{" "}
              <Link href={`/${locale}/auth/sign-up`} className="font-medium text-teal-800 hover:underline">
                {t("createAccount")}
              </Link>
            </span>
          </div>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
