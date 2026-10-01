import "server-only";
import { renderContactEmail, type ContactMessage } from "../contact-email";
import { CONTACT_FROM_EMAIL, getResendClient, runResendOperation } from "@/lib/resend";

type ContactResult = { ok: true } | { ok: false; error: string; status: 502 | 503 };

export async function sendContactMessage(
  { name, email, subject, message, locale }: ContactMessage,
  idempotencyKey?: string,
): Promise<ContactResult> {
  const resend = getResendClient();
  const recipient = process.env.CONTACT_TO_EMAIL;
  if (!resend || !recipient) {
    console.error("Contact email is missing RESEND_API_KEY or CONTACT_TO_EMAIL.");
    return { ok: false, error: "Email service is temporarily unavailable.", status: 503 };
  }

  const html = await renderContactEmail({ name, email, subject, message, locale });
  const result = await runResendOperation("Resend contact delivery request failed", () =>
    resend.emails.send(
      {
        from: CONTACT_FROM_EMAIL,
        to: recipient,
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
