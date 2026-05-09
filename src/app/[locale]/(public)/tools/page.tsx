import { getTranslations } from "next-intl/server";

export default async function ToolsPage() {
  const t = await getTranslations();
  return <PublicStub title={t("Tools")} items={["Resume Builder", "ATS Checker", "LinkedIn Optimizer", "Career GPS"]} />;
}

function PublicStub({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="text-3xl font-semibold">{title}</h1>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {items.map((item) => (
          <div key={item} className="rounded-lg border bg-card p-4 font-medium">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
