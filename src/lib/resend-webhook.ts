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
