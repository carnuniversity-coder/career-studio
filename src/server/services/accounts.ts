import { randomBytes } from "crypto";
import type { UserProfile } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export function splitFullName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const firstName = parts.shift() ?? "";
  const lastName = parts.join(" ");

  return { firstName, lastName };
}

export async function generateReferralCode() {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = randomBytes(6).toString("base64url").toUpperCase().slice(0, 8);
    const existing = await prisma.userProfile.findUnique({
      where: { referralCode: code },
      select: { id: true },
    });

    if (!existing) {
      return code;
    }
  }

  return randomBytes(9).toString("base64url").toUpperCase().slice(0, 12);
}

export async function ensureUserProfile(
  userId: string,
  options: {
    referredById?: string;
  } = {}
): Promise<UserProfile> {
  const existing = await prisma.userProfile.findUnique({
    where: { userId },
  });

  if (existing) {
    return existing;
  }

  return prisma.userProfile.create({
    data: {
      userId,
      referralCode: await generateReferralCode(),
      referredById: options.referredById,
    },
  });
}

export async function refreshReferrerRewards(referrerUserId: string) {
  const referralCount = await prisma.userProfile.count({
    where: { referredById: referrerUserId },
  });

  await prisma.userProfile.update({
    where: { userId: referrerUserId },
    data: {
      totalReferrals: referralCount,
      proTemplatesEarned: Math.floor(referralCount / 5),
    },
  });
}
