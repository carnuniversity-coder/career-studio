import { getTranslations } from "next-intl/server";

import { LangSwitcher } from "@/components/lang-switcher";
import { AppSidebar } from "@/components/nav/app-sidebar";
import { defaultLocale, isLocale } from "@/i18n-config";

export default async function AuthenticatedLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = await getTranslations();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AppSidebar locale={locale} />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur">
          <div className="font-semibold">{t("Dashboard")}</div>
          <LangSwitcher />
        </header>
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
