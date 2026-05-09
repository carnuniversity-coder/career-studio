import Link from "next/link";
import { BriefcaseBusiness, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";

import type { Locale } from "@/i18n-config";

export function AuthShell({
  locale,
  brand,
  title,
  subtitle,
  featureTitleOne,
  featureBodyOne,
  featureTitleTwo,
  featureBodyTwo,
  featureTitleThree,
  featureBodyThree,
  children,
}: {
  locale: Locale;
  brand: string;
  title: string;
  subtitle: string;
  featureTitleOne: string;
  featureBodyOne: string;
  featureTitleTwo: string;
  featureBodyTwo: string;
  featureTitleThree: string;
  featureBodyThree: string;
  children: React.ReactNode;
}) {
  const features = [
    { icon: Sparkles, title: featureTitleOne, body: featureBodyOne },
    { icon: ShieldCheck, title: featureTitleTwo, body: featureBodyTwo },
    { icon: CheckCircle2, title: featureTitleThree, body: featureBodyThree },
  ];

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[0.9fr_1.1fr]">
      <section className="flex items-center border-b bg-gradient-to-br from-teal-800 via-teal-700 to-amber-600 px-6 py-10 text-white lg:border-b-0 lg:px-12">
        <div className="mx-auto max-w-lg">
          <Link href={`/${locale}`} className="inline-flex items-center gap-2 font-semibold">
            <span className="flex size-10 items-center justify-center rounded-md bg-white/15">
              <BriefcaseBusiness className="size-5" />
            </span>
            {brand}
          </Link>
          <h1 className="mt-10 text-4xl font-semibold tracking-tight md:text-5xl">{title}</h1>
          <p className="mt-4 text-base leading-7 text-teal-50">{subtitle}</p>
          <div className="mt-8 grid gap-5">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div key={feature.title} className="flex gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-white/15">
                    <Icon className="size-5" />
                  </span>
                  <span>
                    <span className="block font-semibold">{feature.title}</span>
                    <span className="mt-1 block text-sm leading-6 text-teal-50">{feature.body}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <section className="flex items-center px-4 py-10">
        <div className="mx-auto w-full max-w-md">{children}</div>
      </section>
    </main>
  );
}
