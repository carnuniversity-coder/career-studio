import { getTranslations } from "next-intl/server";

export default async function ResumesPage() {
  const t = await getTranslations();
  return <FeaturePage title={t("Resumes")} />;
}

function FeaturePage({ title }: { title: string }) {
  return <div className="rounded-lg border bg-card p-6"><h1 className="text-2xl font-semibold">{title}</h1></div>;
}
