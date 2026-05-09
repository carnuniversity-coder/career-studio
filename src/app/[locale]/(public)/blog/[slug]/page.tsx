import { getTranslations } from "next-intl/server";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const t = await getTranslations();
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-sm font-medium text-teal-700">{t("Blog")}</p>
      <h1 className="mt-2 text-3xl font-semibold">{slug}</h1>
    </article>
  );
}
