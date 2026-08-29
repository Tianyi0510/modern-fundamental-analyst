import { NextResponse } from "next/server";
import { cleanSingleLine, cleanText, isValidEmail, readProtectedObjectJson } from "@/lib/api-request";
import { createRateLimiter } from "@/lib/rate-limit";
import { CONTACT_FROM_EMAIL, getResendClient, getResendIdempotencyKey, runResendOperation } from "@/lib/resend";

export const runtime = "nodejs";

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const isRateLimited = createRateLimiter({ namespace: "contact", windowMs: RATE_LIMIT_WINDOW_MS, maxRequests: 5 });

type ContactRequest = {
  name?: unknown;
  email?: unknown;
  subject?: unknown;
  message?: unknown;
  website?: unknown;
  locale?: unknown;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character] ?? character);
}

export async function POST(request: Request) {
  const parsed = await readProtectedObjectJson<ContactRequest>(request, {
    isRateLimited,
    maxBytes: 20_000,
    rateLimitWindowMs: RATE_LIMIT_WINDOW_MS,
  });
  if (!parsed.ok) return parsed.response;
  const { body } = parsed;

  const name = cleanSingleLine(body.name, 100);
  const email = cleanSingleLine(body.email, 254).toLowerCase();
  const subject = cleanSingleLine(body.subject, 160);
  const message = cleanText(body.message, 5000);
  const website = cleanText(body.website, 200);
  const locale = cleanText(body.locale, 10);
  if (website) return NextResponse.json({ ok: true });
  if (!name || !subject || message.length < 10 || !isValidEmail(email)) {
    return NextResponse.json({ error: "Please complete every required field." }, { status: 400 });
  }

  const resend = getResendClient();
  const recipient = process.env.CONTACT_TO_EMAIL;
  if (!resend || !recipient) {
    console.error("Contact email is missing RESEND_API_KEY or CONTACT_TO_EMAIL.");
    return NextResponse.json({ error: "Email service is temporarily unavailable." }, { status: 503 });
  }

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");
  const idempotencyKey = getResendIdempotencyKey(request, "contact");
  const result = await runResendOperation("Resend contact delivery request failed", () => resend.emails.send({
    from: CONTACT_FROM_EMAIL,
    to: recipient,
    replyTo: email,
    subject: `[MFA Contact] ${subject}`,
    text: `Name: ${name}\nEmail: ${email}\nLanguage: ${locale || "unknown"}\nSubject: ${subject}\n\n${message}`,
    html: `<h1>New website message</h1><p><strong>Name:</strong> ${safeName}</p><p><strong>Email:</strong> ${safeEmail}</p><p><strong>Language:</strong> ${escapeHtml(locale || "unknown")}</p><p><strong>Subject:</strong> ${safeSubject}</p><hr /><p>${safeMessage}</p>`,
  }, idempotencyKey ? { idempotencyKey } : undefined));

  if (!result || result.error) {
    if (result?.error) console.error("Resend contact delivery failed", result.error.name);
    return NextResponse.json({ error: "Message could not be sent." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
