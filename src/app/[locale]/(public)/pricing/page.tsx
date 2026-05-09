import type { Metadata } from "next";
import Link from "next/link";
import { Check, Clock3, ShieldCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { SectionHeading } from "@/components/marketing/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { defaultLocale, isLocale } from "@/i18n-config";
import { pricingPlans } from "@/lib/public-content";
import { cn } from "@/lib/utils";

type LocaleParams = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = await getTranslations({ locale, namespace: "phase1.meta.pricing" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function PricingPage({ params }: LocaleParams) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = await getTranslations({ locale, namespace: "phase1.pricing" });

  return (
    <div className="bg-white">
      <section className="border-b bg-gradient-to-br from-white via-teal-50 to-rose-50">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <SectionHeading
            eyebrow={t("eyebrow")}
            title={t("title")}
            description={t("description")}
            align="center"
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-5 lg:grid-cols-3">
          {pricingPlans.map((plan) => (
            <Card
              key={plan.name}
              className={cn(
                "bg-white",
                plan.highlighted && "border-teal-300 shadow-lg shadow-teal-100",
                plan.disabled && "opacity-90"
              )}
            >
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  {plan.badge ? (
                    <Badge
                      variant={plan.highlighted ? "default" : "secondary"}
                      className={cn("rounded-md", plan.highlighted && "bg-teal-700")}
                    >
                      {plan.badge}
                    </Badge>
                  ) : null}
                </div>
                <p className="text-sm leading-6 text-neutral-600">{plan.description}</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-semibold tracking-tight text-neutral-950">{plan.price}</span>
                  <span className="pb-1 text-sm text-neutral-500">{plan.period}</span>
                </div>
                <ul className="mt-6 grid gap-3 text-sm text-neutral-700">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-3">
                      <Check className="mt-0.5 size-4 shrink-0 text-teal-700" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="bg-neutral-50">
                {plan.disabled ? (
                  <Button disabled className="w-full">
                    <Clock3 className="size-4" />
                    {plan.cta}
                  </Button>
                ) : (
                  <Button asChild className="w-full bg-teal-700 text-white hover:bg-teal-800">
                    <Link href={`/${locale}${plan.href}`}>{plan.cta}</Link>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-10 rounded-xl border bg-amber-50 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 font-semibold text-amber-950">
                <ShieldCheck className="size-5" />
                {t("noteTitle")}
              </div>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-amber-950/75">{t("noteBody")}</p>
            </div>
            <Badge variant="outline" className="w-fit rounded-md border-amber-300 bg-white text-amber-950">
              LKR
            </Badge>
          </div>
        </div>
      </section>
    </div>
  );
}
