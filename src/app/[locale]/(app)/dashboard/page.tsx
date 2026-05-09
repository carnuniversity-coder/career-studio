import { getTranslations } from "next-intl/server";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const t = await getTranslations();
  const metrics = ["Resumes", "ATS Checker", "Job Tracker", "Salary Insights"];

  return (
    <div>
      <h1 className="text-2xl font-semibold">{t("Dashboard")}</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric}>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">{t(metric)}</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold">0</CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
