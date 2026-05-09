import { getTranslations } from "next-intl/server";

export default async function ResetPage() {
  const t = await getTranslations();
  return <div className="mx-auto max-w-md px-4 py-12 text-2xl font-semibold">{t("Settings")}</div>;
}
