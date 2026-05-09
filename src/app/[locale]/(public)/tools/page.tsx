import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Bot, BriefcaseBusiness, FileText, Gauge, Network, PenLine } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { SectionHeading } from "@/components/marketing/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { defaultLocale, isLocale } from "@/i18n-config";
import { toolShowcaseItems } from "@/lib/public-content";

type LocaleParams = {
  params: Promise<{ locale: string }>;
};

const toolIcons = [FileText, Gauge, PenLine, Network, BriefcaseBusiness, Bot, Gauge, BriefcaseBusiness, FileText] as const;

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = await getTranslations({ locale, namespace: "phase1.meta.tools" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function ToolsPage({ params }: LocaleParams) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = await getTranslations({ locale, namespace: "phase1.tools" });

  return (
    <div className="bg-white">
      <section className="border-b bg-gradient-to-br from-teal-50 via-white to-orange-50">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <SectionHeading eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {toolShowcaseItems.map((tool, index) => {
            const Icon = toolIcons[index];
            const isActive = tool.status === "active";

            return (
              <Card key={tool.title} className={isActive ? "bg-white" : "bg-neutral-50 opacity-80"}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex size-11 items-center justify-center rounded-md bg-teal-100 text-teal-800">
                      <Icon className="size-5" />
                    </div>
                    <Badge variant={isActive ? "secondary" : "outline"} className="rounded-md">
                      {tool.badge}
                    </Badge>
                  </div>
                  <CardTitle>{tool.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-6 text-neutral-600">{tool.description}</CardContent>
                <CardFooter className="bg-neutral-50">
                  {isActive && tool.href ? (
                    <Button asChild variant="outline" className="w-full">
                      <Link href={`/${locale}${tool.href}`}>
                        {t("openTool")}
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  ) : (
                    <Button disabled variant="secondary" className="w-full">
                      {t("comingSoon")}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="rounded-xl border bg-neutral-950 px-6 py-10 text-white md:px-10">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-200">{t("proEyebrow")}</p>
              <h2 className="mt-3 text-3xl font-semibold">{t("proTitle")}</h2>
              <p className="mt-3 max-w-2xl text-neutral-300">{t("proDescription")}</p>
            </div>
            <Button disabled size="lg" variant="secondary">
              {t("comingSoon")}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
