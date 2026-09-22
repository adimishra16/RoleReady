/**
 * Parse Vercel AI SDK data stream chunks — append text deltas (0:) only.
 * Surfaces protocol error frames (3:) so the UI is not left blank on provider failures.
 */
export class AiStreamError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiStreamError";
  }
}

export function appendAiDataStreamText(accumulated: string, chunk: string): string {
  let result = accumulated;

  for (const line of chunk.split("\n")) {
    if (!line) continue;

    if (line.startsWith("3:")) {
      let message = "AI generation failed.";
      try {
        const parsed = JSON.parse(line.slice(2));
        if (typeof parsed === "string" && parsed.trim()) message = parsed;
      } catch {
        // keep default
      }
      throw new AiStreamError(message);
    }

    if (!line.startsWith("0:")) continue;

    try {
      const text = JSON.parse(line.slice(2));
      if (typeof text === "string") {
        result += text;
      }
    } catch {
      // Ignore partial JSON from chunked reads
    }
  }

  return result;
}

/** Remove any leaked stream metadata from already-parsed text. */
export function stripAiStreamArtifacts(text: string): string {
  return text.replace(/f:\{"messageId":"[^"]*"\}\s*/g, "").trimStart();
}
