/**
 * Parse Vercel AI SDK data stream chunks — append text deltas (0:) only.
 * Skips protocol frames: f (messageId), d (data), e (error), tool calls, etc.
 */
export function appendAiDataStreamText(accumulated: string, chunk: string): string {
  let result = accumulated;

  for (const line of chunk.split("\n")) {
    if (!line || !line.startsWith("0:")) continue;

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
