import { getAiAccessStatus } from "@/lib/ai/access";

export const runtime = "nodejs";

export async function GET() {
  try {
    const status = await getAiAccessStatus();
    return Response.json(status);
  } catch (error) {
    console.error("AI status error:", error);
    return Response.json(
      {
        enabled: false,
        reason: "db_missing",
        rewrite: { used: 0, limit: 0, remaining: 0 },
        other: { used: 0, limit: 0, remaining: 0 },
      },
      { status: 500 }
    );
  }
}
