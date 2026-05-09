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
  const { fileTypeFromBuffer } = await import("file-type");
  const detected = await fileTypeFromBuffer(buffer);
  return detected?.mime ?? "application/octet-stream";
}

export function assertFileSize(size: number, maxBytes: number) {
  if (size > maxBytes) {
    throw new Error(`File exceeds ${Math.round(maxBytes / 1024 / 1024)}MB limit`);
  }
}
