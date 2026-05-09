import { getTranslations } from "next-intl/server";

export default async function InterviewPage() {
  const t = await getTranslations();
  return <div className="rounded-lg border bg-card p-6"><h1 className="text-2xl font-semibold">{t("Interview")}</h1></div>;
}
