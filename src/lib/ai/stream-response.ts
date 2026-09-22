import { streamText } from "ai";
import type { LanguageModel } from "ai";
import { getAiModel } from "@/lib/ai/provider";

/** Friendly message for AI SDK / provider failures (often streamed as `3:` frames). */
export function formatAiProviderError(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error ?? "");
  if (/401|unauthorized|authenticate|invalid.*api.?key|incorrect api key/i.test(msg)) {
    return "AI provider authentication failed. Update NEBIUS_API_KEY in .env.local (from tokenfactory.nebius.com) and restart npm run dev.";
  }
  if (/404|model.?not.?found|does not exist/i.test(msg)) {
    return "AI model not found. Check NEBIUS_MODEL in .env.local against your Nebius model list.";
  }
  if (/429|rate.?limit/i.test(msg)) {
    return "AI provider rate limit hit. Wait a moment and try again.";
  }
  return msg.trim() || "AI generation failed.";
}

/** Encode text as a Vercel AI SDK data stream (`0:` text parts). */
export function mockDataStreamResponse(text: string): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const words = text.split(" ");
      for (let i = 0; i < words.length; i++) {
        const word = words[i] + (i < words.length - 1 ? " " : "");
        controller.enqueue(encoder.encode(`0:${JSON.stringify(word)}\n`));
        await new Promise((resolve) => setTimeout(resolve, 25));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Vercel-AI-Data-Stream": "v1",
    },
  });
}

type StreamOpts = {
  system: string;
  prompt: string;
  /** Used when no provider key is configured. */
  fallbackText: string;
  model?: LanguageModel | null;
};

/**
 * Stream from Nebius/OpenAI/Google when configured; otherwise mock.
 * Provider errors are written as data-stream error frames (`3:`) so the UI can show them.
 */
export function streamModelOrMock(opts: StreamOpts): Response {
  const model = opts.model === undefined ? getAiModel() : opts.model;
  if (!model) {
    return mockDataStreamResponse(opts.fallbackText);
  }

  const result = streamText({
    model,
    system: opts.system,
    prompt: opts.prompt,
  });

  return result.toDataStreamResponse({
    getErrorMessage: formatAiProviderError,
  });
}
