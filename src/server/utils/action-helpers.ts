import { redirect } from "next/navigation";

import type { Locale } from "@/i18n-config";
import { auth } from "@/lib/auth";

export function authPath(locale: Locale, path: string, params?: Record<string, string>) {
  const search = new URLSearchParams(params);
  const suffix = search.size > 0 ? `?${search.toString()}` : "";

  return `/${locale}${path}${suffix}`;
}

export function formValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

export async function requireUser(locale: Locale) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(authPath(locale, "/auth/sign-in"));
  }

  return session.user;
}
