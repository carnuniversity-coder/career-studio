import Link from "next/link";
import { BriefcaseBusiness } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { LangSwitcher } from "@/components/lang-switcher";
import type { Locale } from "@/i18n-config";

const navItems = [
  ["Home", ""],
  ["Tools", "tools"],
  ["Resources", "resources"],
  ["Courses", "courses"],
  ["Pricing", "pricing"],
  ["Blog", "blog"],
] as const;

export async function PublicNav({ locale }: { locale: Locale }) {
  const t = await getTranslations();
  const prefix = `/${locale}`;

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href={prefix} className="flex items-center gap-2 font-semibold">
          <span className="flex size-9 items-center justify-center rounded-md bg-teal-700 text-white">
            <BriefcaseBusiness className="size-5" />
          </span>
          <span>{t("Career Studio")}</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground lg:flex">
          {navItems.map(([label, href]) => (
            <Link key={label} href={`${prefix}/${href}`.replace(/\/$/, "")} className="hover:text-foreground">
              {t(label)}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <LangSwitcher />
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href={`${prefix}/auth/sign-in`}>{t("Sign In")}</Link>
          </Button>
          <Button asChild>
            <Link href={`${prefix}/auth/sign-up`}>{t("Get Started")}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
