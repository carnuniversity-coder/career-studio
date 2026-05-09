import { fileTypeFromBuffer } from "file-type";
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

export const resumeMimeTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export const messageMimeTypes = new Set([
  ...resumeMimeTypes,
  "image/png",
  "image/jpeg",
  "image/webp",
  "text/plain",
  "text/csv",
]);

export async function detectFileMime(buffer: Buffer) {
  const detected = await fileTypeFromBuffer(buffer);
  return detected?.mime ?? "application/octet-stream";
}

export function assertFileSize(size: number, maxBytes: number) {
  if (size > maxBytes) {
    throw new Error(`File exceeds ${Math.round(maxBytes / 1024 / 1024)}MB limit`);
  }
}
