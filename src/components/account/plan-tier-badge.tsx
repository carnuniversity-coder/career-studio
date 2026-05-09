import type { PlanTier } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const planBadgeClasses: Record<PlanTier, string> = {
  basic: "border-neutral-200 bg-neutral-100 text-neutral-800",
  pro: "border-teal-200 bg-teal-100 text-teal-900",
  premium: "border-amber-200 bg-amber-100 text-amber-950",
};

export function PlanTierBadge({ planTier, label }: { planTier: PlanTier; label: string }) {
  return (
    <Badge variant="outline" className={cn("h-7 rounded-md px-2.5 capitalize", planBadgeClasses[planTier])}>
      {label}
    </Badge>
  );
}
