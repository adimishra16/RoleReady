import { createOpenAI, openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import type { LanguageModel } from "ai";

const NEBIUS_BASE_URL = "https://api.tokenfactory.nebius.com/v1/";
const DEFAULT_NEBIUS_MODEL = "deepseek-ai/DeepSeek-V4-Flash-0731";

function hasSecret(value: string | undefined): value is string {
  const trimmed = value?.trim();
  return Boolean(trimmed && !trimmed.includes("placeholder"));
}

/**
 * Prefer Nebius Token Factory (OpenAI-compatible), then OpenAI, then Google.
 * Returns null so routes can fall back to the local mock stream.
 */
export function getAiModel(): LanguageModel | null {
  const nebiusKey = process.env.NEBIUS_API_KEY;
  if (hasSecret(nebiusKey)) {
    const nebius = createOpenAI({
      name: "nebius",
      baseURL: process.env.NEBIUS_BASE_URL || NEBIUS_BASE_URL,
      apiKey: nebiusKey.trim(),
      compatibility: "compatible",
    });
    return nebius(process.env.NEBIUS_MODEL || DEFAULT_NEBIUS_MODEL);
  }

  if (hasSecret(process.env.OPENAI_API_KEY)) {
    return openai("gpt-4o-mini");
  }

  if (hasSecret(process.env.GOOGLE_GENERATIVE_AI_API_KEY)) {
    return google("gemini-1.5-flash");
  }

  return null;
}
