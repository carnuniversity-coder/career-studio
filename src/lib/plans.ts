import type { PlanTier } from "@prisma/client";

export const planRank: Record<PlanTier, number> = {
  basic: 0,
  pro: 1,
  premium: 2,
};

export const planLimits: Record<
  PlanTier,
  {
    dailyExports: number;
    monthlyAts: number;
    monthlyAi: number;
  }
> = {
  basic: {
    dailyExports: 5,
    monthlyAts: 10,
    monthlyAi: 50,
  },
  pro: {
    dailyExports: 25,
    monthlyAts: 50,
    monthlyAi: 200,
  },
  premium: {
    dailyExports: 999999,
    monthlyAts: 999999,
    monthlyAi: 999999,
  },
};
