"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { env } from "@/env";
import type { Locale } from "@/i18n-config";
import { auth, signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { lkPhoneRegex, normalizeLkPhone } from "@/lib/phone";
import { ensureUserProfile, generateReferralCode, refreshReferrerRewards, splitFullName } from "@/server/services/accounts";

const emailSchema = z.string().trim().email().toLowerCase();

const signInSchema = z.object({
  email: emailSchema,
});

const signUpSchema = z.object({
  name: z.string().trim().max(150).optional().default(""),
  email: emailSchema,
  referralCode: z.string().trim().max(20).optional().default(""),
  terms: z.literal("on"),
});

const optionalPhoneSchema = z
  .string()
  .trim()
  .refine((value) => value === "" || lkPhoneRegex.test(value), "Invalid Sri Lankan phone number")
  .transform((value) => (value === "" ? "" : normalizeLkPhone(value)));

const optionalUrlSchema = z
  .string()
  .trim()
  .refine((value) => value === "" || z.string().url().safeParse(value).success, "Invalid URL");

const profileSchema = z.object({
  firstName: z.string().trim().max(150),
  lastName: z.string().trim().max(150),
  phone: optionalPhoneSchema,
  linkedinUrl: optionalUrlSchema,
});

const emailUpdateSchema = z.object({
  email: emailSchema,
});

function authPath(locale: Locale, path: string, params?: Record<string, string>) {
  const search = new URLSearchParams(params);
  const suffix = search.size > 0 ? `?${search.toString()}` : "";

  return `/${locale}${path}${suffix}`;
}

function formValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function redirectTarget(locale: Locale, formData: FormData, fallbackPath: string) {
  const callbackUrl = formValue(formData, "callbackUrl");

  if (callbackUrl.startsWith(`/${locale}/`) && !callbackUrl.startsWith(`/${locale}/auth/`)) {
    return callbackUrl;
  }

  return authPath(locale, fallbackPath);
}

export async function requestEmailSignIn(locale: Locale, formData: FormData) {
  const parsed = signInSchema.safeParse({
    email: formValue(formData, "email"),
  });

  if (!parsed.success) {
    redirect(authPath(locale, "/auth/sign-in", { error: "invalid-email" }));
  }

  await signIn("resend", {
    email: parsed.data.email,
    redirectTo: redirectTarget(locale, formData, "/dashboard"),
  });
}

export async function requestRecoveryLink(locale: Locale, formData: FormData) {
  const parsed = signInSchema.safeParse({
    email: formValue(formData, "email"),
  });

  if (!parsed.success) {
    redirect(authPath(locale, "/auth/reset", { error: "invalid-email" }));
  }

  await signIn("resend", {
    email: parsed.data.email,
    redirectTo: authPath(locale, "/settings"),
  });
}

export async function signInWithGoogle(locale: Locale, formData: FormData) {
  if (!env.AUTH_GOOGLE_ID || !env.AUTH_GOOGLE_SECRET) {
    redirect(authPath(locale, "/auth/sign-in", { error: "google-unconfigured" }));
  }

  await signIn("google", {
    redirectTo: redirectTarget(locale, formData, "/dashboard"),
  });
}

export async function createAccountAndSendLink(locale: Locale, formData: FormData) {
  const parsed = signUpSchema.safeParse({
    name: formValue(formData, "name"),
    email: formValue(formData, "email"),
    referralCode: formValue(formData, "referralCode"),
    terms: formValue(formData, "terms"),
  });

  if (!parsed.success) {
    redirect(authPath(locale, "/auth/sign-up", { error: "invalid" }));
  }

  const { firstName, lastName } = splitFullName(parsed.data.name);
  const referrer = parsed.data.referralCode
    ? await prisma.userProfile.findUnique({
        where: { referralCode: parsed.data.referralCode.toUpperCase() },
        select: { userId: true },
      })
    : null;
  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    include: { profile: true },
  });

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        firstName: existing.firstName || firstName,
        lastName: existing.lastName || lastName,
      },
    });
    await ensureUserProfile(existing.id);
  } else {
    await prisma.user.create({
      data: {
        email: parsed.data.email,
        firstName,
        lastName,
        profile: {
          create: {
            referralCode: await generateReferralCode(),
            referredById: referrer?.userId,
          },
        },
      },
    });

    if (referrer?.userId) {
      await refreshReferrerRewards(referrer.userId);
    }
  }

  await signIn("resend", {
    email: parsed.data.email,
    redirectTo: redirectTarget(locale, formData, "/dashboard"),
  });
}

export async function updateProfile(locale: Locale, formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(authPath(locale, "/auth/sign-in"));
  }

  const parsed = profileSchema.safeParse({
    firstName: formValue(formData, "firstName"),
    lastName: formValue(formData, "lastName"),
    phone: formValue(formData, "phone"),
    linkedinUrl: formValue(formData, "linkedinUrl"),
  });

  if (!parsed.success) {
    redirect(authPath(locale, "/settings", { error: "profile" }));
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      profile: {
        upsert: {
          create: {
            referralCode: await generateReferralCode(),
            phone: parsed.data.phone,
            linkedinUrl: parsed.data.linkedinUrl,
          },
          update: {
            phone: parsed.data.phone,
            linkedinUrl: parsed.data.linkedinUrl,
          },
        },
      },
    },
  });

  redirect(authPath(locale, "/settings", { saved: "profile" }));
}

export async function updateAccountEmail(locale: Locale, formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(authPath(locale, "/auth/sign-in"));
  }

  const parsed = emailUpdateSchema.safeParse({
    email: formValue(formData, "email"),
  });

  if (!parsed.success) {
    redirect(authPath(locale, "/settings", { error: "email" }));
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });

  if (existing && existing.id !== session.user.id) {
    redirect(authPath(locale, "/settings", { error: "email-taken" }));
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      email: parsed.data.email,
      emailVerified: null,
    },
  });

  redirect(authPath(locale, "/settings", { saved: "email" }));
}

export async function signOutCurrentSession(locale: Locale) {
  await signOut({
    redirectTo: `/${locale}`,
  });
}
