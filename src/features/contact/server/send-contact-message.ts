import "server-only";
import { CONTACT_RECIPIENT } from "./contact-config";
import { renderContactEmail, type ContactMessage } from "../contact-email";
import { CONTACT_FROM_EMAIL, getResendClient, runResendOperation } from "@/lib/resend";

type ContactResult = { ok: true } | { ok: false; error: string; status: 502 | 503 };

export async function sendContactMessage(
  { name, email, subject, message, locale }: ContactMessage,
  idempotencyKey?: string,
): Promise<ContactResult> {
  const resend = getResendClient();
  if (!resend) {
    console.error("Contact email is missing RESEND_API_KEY.");
    return { ok: false, error: "Email service is temporarily unavailable.", status: 503 };
  }

  const html = await renderContactEmail({ name, email, subject, message, locale });
  const result = await runResendOperation("Resend contact delivery request failed", () =>
    resend.emails.send(
      {
        from: CONTACT_FROM_EMAIL,
        to: CONTACT_RECIPIENT,
        replyTo: email,
        subject: `[MFA Contact] ${subject}`,
        text: `Name: ${name}\nEmail: ${email}\nLanguage: ${locale || "unknown"}\nSubject: ${subject}\n\n${message}`,
        html,
      },
      idempotencyKey ? { idempotencyKey } : undefined,
    ),
  );

  if (!result || result.error) {
    if (result?.error) console.error("Resend contact delivery failed", result.error.name);
    return { ok: false, error: "Message could not be sent.", status: 502 };
  }

  return { ok: true };
}
