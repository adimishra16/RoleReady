import { Webhook } from "svix";
import { headers } from "next/headers";
import { db, isDbConfigured } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    if (!isDbConfigured || !db) {
      return Response.json({ received: true, simulated: true });
    }

    const payloadText = await req.text();
    let eventType: string;
    let data: any;

    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (webhookSecret) {
      const headerPayload = await headers();
      const svixId = headerPayload.get("svix-id");
      const svixTimestamp = headerPayload.get("svix-timestamp");
      const svixSignature = headerPayload.get("svix-signature");

      if (!svixId || !svixTimestamp || !svixSignature) {
        return new Response(JSON.stringify({ error: "Missing Svix headers" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const wh = new Webhook(webhookSecret);
      const evt = wh.verify(payloadText, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as { type: string; data: any };

      eventType = evt.type;
      data = evt.data;
    } else {
      const payload = JSON.parse(payloadText);
      eventType = payload.type;
      data = payload.data;
      console.warn("CLERK_WEBHOOK_SECRET not set — webhook signature not verified");
    }

    if (eventType === "user.created" || eventType === "user.updated") {
      const { id, email_addresses, first_name, last_name, username } = data;
      const primaryEmail =
        email_addresses?.find((e: any) => e.id === data.primary_email_address_id)?.email_address ||
        email_addresses?.[0]?.email_address;
      const fullName =
        [first_name, last_name].filter(Boolean).join(" ") || username || "User";

      if (id && primaryEmail) {
        await db
          .insert(users)
          .values({
            id,
            email: primaryEmail,
            name: fullName,
          })
          .onConflictDoUpdate({
            target: users.id,
            set: {
              email: primaryEmail,
              name: fullName,
              updatedAt: new Date(),
            },
          });
      }
    } else if (eventType === "user.deleted") {
      const { id } = data;
      if (id) {
        await db.delete(users).where(eq(users.id, id));
      }
    }

    return Response.json({ received: true });
  } catch (error: any) {
    console.error("Clerk Webhook Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
