import "server-only";
import { createHash } from "node:crypto";
import { executeRedisCommand, getRedisClient } from "@/lib/redis";
import { getResendClient, runResendOperation } from "@/lib/resend";
import { subscriptionKey, withSubscriberLock } from "./resend-coordination";
import type { WebhookEventPayload } from "resend";

export function getResendWebhookHeaders(headers: Headers) {
  const id = headers.get("svix-id");
  const timestamp = headers.get("svix-timestamp");
  const signature = headers.get("svix-signature");
  return id && timestamp && signature ? { id, timestamp, signature } : null;
}

export function getUnsubscribeRecipients(event: WebhookEventPayload) {
  switch (event.type) {
    case "email.bounced":
    case "email.complained":
    case "email.suppressed":
      return [...new Set(event.data.to.map((email) => email.trim().toLowerCase()).filter(Boolean))];
    default:
      return [];
  }
}

// Keep deduplication and suppression state independent of the provider API key.
// Caller verifies the signature before invoking this function.
export async function processDeliveryFeedback(event: WebhookEventPayload, eventId: string) {
  const recipients = getUnsubscribeRecipients(event);
  if (!recipients.length) return;
  const redis = getRedisClient();
  const resend = getResendClient();
  if (!redis || !resend) throw new Error("Webhook service unavailable");
  for (const email of recipients) {
    await withSubscriberLock(email, async () => {
      const eventKey = `mfa:resend:webhook:${createHash("sha256")
        .update(JSON.stringify([eventId, email]))
        .digest("hex")}`;
      if (await executeRedisCommand(redis, () => redis.get(eventKey))) return;
      // Persist feedback before the provider write. A later public signup must
      // never undo a complaint or bounce, including after a partial failure.
      await executeRedisCommand(redis, () => redis.set(subscriptionKey("suppression", email), event.type));
      const result = await runResendOperation("Resend webhook contact update failed", () =>
        resend.contacts.update({ email, unsubscribed: true }),
      );
      if (!result || (result.error && result.error.statusCode !== 404)) throw new Error("Webhook processing failed");
      // Retain completed IDs: dashboard replays are not limited to retry windows.
      await executeRedisCommand(redis, () => redis.set(eventKey, "done"));
    });
  }
}
