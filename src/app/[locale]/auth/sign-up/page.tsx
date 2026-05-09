import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { AuthShell } from "@/components/auth/auth-shell";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { defaultLocale, isLocale } from "@/i18n-config";
import { createAccountAndSendLink, signInWithGoogle } from "@/server/actions/accounts";

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
  const t = await getTranslations({ locale, namespace: "phase2.meta.signUp" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function SignUpPage({ params, searchParams }: AuthPageProps) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const query = await searchParams;
  const t = await getTranslations({ locale, namespace: "phase2.auth" });
  const error = firstParam(query.error);
  const errorKey = ["invalid", "google-unconfigured"].includes(error) ? error : "default";
  const signUpAction = createAccountAndSendLink.bind(null, locale);
  const googleAction = signInWithGoogle.bind(null, locale);

  return (
    <AuthShell
      locale={locale}
      brand={t("brand")}
      title={t("signUpShellTitle")}
      subtitle={t("signUpShellSubtitle")}
      featureTitleOne={t("featureFreeTitle")}
      featureBodyOne={t("featureFreeBody")}
      featureTitleTwo={t("featurePrivateTitle")}
      featureBodyTwo={t("featurePrivateBody")}
      featureTitleThree={t("featureSetupTitle")}
      featureBodyThree={t("featureSetupBody")}
    >
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-2xl">{t("signUpTitle")}</CardTitle>
          <p className="text-sm leading-6 text-neutral-600">{t("signUpSubtitle")}</p>
        </CardHeader>
        <CardContent className="space-y-5">
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{t(`errors.${errorKey}`)}</AlertDescription>
            </Alert>
          ) : null}
          <form action={googleAction}>
            <Button type="submit" variant="outline" className="w-full">
              <span className="font-semibold">G</span>
              {t("signUpGoogle")}
            </Button>
          </form>
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-neutral-500">
            <span className="h-px flex-1 bg-neutral-200" />
            {t("or")}
            <span className="h-px flex-1 bg-neutral-200" />
          </div>
          <form action={signUpAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("nameLabel")}</Label>
              <Input id="name" name="name" placeholder={t("namePlaceholder")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("emailLabel")}</Label>
              <Input id="email" name="email" type="email" placeholder={t("emailPlaceholder")} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="referralCode">{t("referralLabel")}</Label>
              <Input id="referralCode" name="referralCode" placeholder={t("referralPlaceholder")} />
            </div>
            <label className="flex items-start gap-2 text-sm leading-6 text-neutral-600">
              <input type="checkbox" name="terms" required className="mt-1 size-4 rounded border-neutral-300" />
              <span>
                {t("termsPrefix")}{" "}
                <Link href={`/${locale}/terms`} className="font-medium text-teal-800 hover:underline">
                  {t("terms")}
                </Link>{" "}
                {t("and")}{" "}
                <Link href={`/${locale}/privacy`} className="font-medium text-teal-800 hover:underline">
                  {t("privacy")}
                </Link>
              </span>
            </label>
            <Button type="submit" className="w-full bg-teal-700 text-white hover:bg-teal-800">
              {t("createAccountSendLink")}
              <ArrowRight className="size-4" />
            </Button>
          </form>
          <p className="text-center text-sm text-neutral-600">
            {t("alreadyHaveAccount")}{" "}
            <Link href={`/${locale}/auth/sign-in`} className="font-medium text-teal-800 hover:underline">
              {t("signIn")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
