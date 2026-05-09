import Link from "next/link";
import { ArrowRight, CheckCircle2, MapPin } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { defaultLocale, isLocale } from "@/i18n-config";

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = await getTranslations();

  return (
    <section className="bg-[radial-gradient(circle_at_top_left,#ccfbf1,transparent_30%),linear-gradient(135deg,#ffffff,#f8fafc)]">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-10 px-4 py-16 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-sm text-teal-800 shadow-sm">
            <MapPin className="size-4" />
            {t("Sri Lanka first")}
          </div>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 md:text-6xl">
            {t("Career Studio")}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            {t("Landing hero subtitle")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href={`/${locale}/auth/sign-up`}>
                {t("Start building")}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href={`/${locale}/dashboard`}>{t("Open dashboard")}</Link>
            </Button>
          </div>
        </div>
        <Card className="border-teal-100 shadow-xl">
          <CardContent className="grid gap-4 p-6">
            {["ATS Checker", "Resume Builder", "Job Tracker", "Career GPS"].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-lg border bg-white p-4">
                <CheckCircle2 className="size-5 text-teal-700" />
                <span className="font-medium">{t(item)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
