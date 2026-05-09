"use server";

import { z } from "zod";

const createResumeSchema = z.object({
  title: z.string().trim().min(1).max(120),
  templateKey: z.string().trim().min(1).max(80).default("classic"),
});

export type CreateResumeInput = z.infer<typeof createResumeSchema>;

export async function createResumeAction(input: CreateResumeInput) {
  const payload = createResumeSchema.parse(input);

  throw new Error(`TODO: port Django resume create flow for ${payload.templateKey}.`);
}
