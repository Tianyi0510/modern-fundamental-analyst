import { postJson } from "@/lib/client-post-json";
import type { Locale } from "@/lib/i18n";

export type ContactMessageRequest = {
  name: string;
  email: string;
  subject: string;
  message: string;
  website: string;
  locale: Locale;
};

// Callers need successful completion, not an unchecked JSON response type.
export async function sendContactMessage(input: ContactMessageRequest, idempotencyKey: string): Promise<void> {
  await postJson("/api/contact", input, { idempotencyKey });
}
