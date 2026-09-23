import { generateText } from "ai";
import type { LanguageModel } from "ai";
import { getAiModel } from "@/lib/ai/provider";

/** Friendly message for AI SDK / provider failures (often streamed as `3:` frames). */
export function formatAiProviderError(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error ?? "");
  if (/401|unauthorized|authenticate|invalid.*api.?key|incorrect api key/i.test(msg)) {
    return "AI provider authentication failed. Update NEBIUS_API_KEY (tokenfactory.nebius.com) and redeploy.";
  }
  if (/404|not found|model.?not.?found|does not exist/i.test(msg)) {
    return "AI model was not found. Set NEBIUS_MODEL to a model id from your Nebius console, then redeploy.";
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
 * Generate from Nebius/OpenAI/Google when configured; otherwise the local fallback.
 * A missing model or auth failure still returns fallback text so the UI is not left on "Not Found".
 */
export async function streamModelOrMock(opts: StreamOpts): Promise<Response> {
  const model = opts.model === undefined ? getAiModel() : opts.model;
  if (!model) {
    return mockDataStreamResponse(opts.fallbackText);
  }

  try {
    const result = await generateText({
      model,
      system: opts.system,
      prompt: opts.prompt,
    });
    const text = result.text?.trim();
    if (!text) return mockDataStreamResponse(opts.fallbackText);
    return mockDataStreamResponse(text);
  } catch (error) {
    console.error("AI provider failed, using fallback:", formatAiProviderError(error));
    return mockDataStreamResponse(opts.fallbackText);
  }
}
