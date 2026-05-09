import { getTranslations } from "next-intl/server";

export default async function CourseToolsPage() {
  const t = await getTranslations();
  return <div className="mx-auto max-w-7xl px-4 py-12"><h1 className="text-3xl font-semibold">{t("Tools")}</h1></div>;
}
