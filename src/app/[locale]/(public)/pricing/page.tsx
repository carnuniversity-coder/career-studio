import { getTranslations } from "next-intl/server";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const plans = ["basic", "pro", "premium"] as const;

export default async function PricingPage() {
  const t = await getTranslations();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="text-3xl font-semibold">{t("Pricing")}</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan}>
            <CardHeader>
              <CardTitle className="capitalize">{plan}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={plan === "basic" ? "secondary" : "default"}>{plan === "basic" ? t("Free") : "LKR"}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
