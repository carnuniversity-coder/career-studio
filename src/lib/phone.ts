import { z } from "zod";

export const lkPhoneRegex = /^(?:\+94|0)\s?\d{2}[\s-]?\d{3}[\s-]?\d{4}$/;

export function normalizeLkPhone(phone: string) {
  const compact = phone.replace(/[\s-]/g, "");
  if (compact.startsWith("+94")) return compact;
  if (compact.startsWith("0")) return `+94${compact.slice(1)}`;
  return compact;
}

export const lkPhoneSchema = z
  .string()
  .regex(lkPhoneRegex)
  .transform(normalizeLkPhone);
