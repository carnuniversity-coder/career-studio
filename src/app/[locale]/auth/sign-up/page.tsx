import { getTranslations } from "next-intl/server";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SignUpPage() {
  const t = await getTranslations();
  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t("Get Started")}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">{t("Coming soon")}</CardContent>
      </Card>
    </div>
  );
}
