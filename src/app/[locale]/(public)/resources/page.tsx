import { getTranslations } from "next-intl/server";

export default async function ResourcesPage() {
  const t = await getTranslations();
  return <div className="mx-auto max-w-7xl px-4 py-12"><h1 className="text-3xl font-semibold">{t("Resources")}</h1></div>;
}
