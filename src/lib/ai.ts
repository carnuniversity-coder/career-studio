import { google } from "@ai-sdk/google";
import { generateObject, generateText } from "ai";
import type { ZodSchema } from "zod";

export const geminiModel = google("gemini-2.5-flash");

export async function generateJsonWithGemini<T>(
  prompt: string,
  schema: ZodSchema<T>,
): Promise<T> {
  const result = await generateObject({
    model: geminiModel,
    schema,
    prompt,
  });
  return result.object;
}

export async function generateTextWithGemini(prompt: string): Promise<string> {
  const result = await generateText({
    model: geminiModel,
    prompt,
  });
  return result.text;
}
