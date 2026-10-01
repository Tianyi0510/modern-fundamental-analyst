import { sendContactMessage } from "@/features/contact/server/send-contact-message";
import { NextResponse } from "next/server";
import { cleanSingleLine, cleanText, isValidEmail, normalizeEmail, readProtectedObjectJson } from "@/lib/api-request";
import { createRateLimiter } from "@/lib/rate-limit";
import { getResendIdempotencyKey } from "@/lib/resend";

export const runtime = "nodejs";

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const isRateLimited = createRateLimiter({ namespace: "contact", windowMs: RATE_LIMIT_WINDOW_MS, maxRequests: 5 });

export async function POST(request: Request) {
  const parsed = await readProtectedObjectJson(request, {
    isRateLimited,
    maxBytes: 20_000,
    rateLimitWindowMs: RATE_LIMIT_WINDOW_MS,
  });
  if (!parsed.ok) return parsed.response;
  const { body } = parsed;

  const name = cleanSingleLine(body.name, 100);
  const email = normalizeEmail(body.email);
  const subject = cleanSingleLine(body.subject, 160);
  const message = cleanText(body.message, 5000);
  const website = cleanText(body.website, 200);
  const locale = cleanText(body.locale, 10);
  if (website) return NextResponse.json({ ok: true });
  if (!name || !subject || message.length < 10 || !isValidEmail(email)) {
    return NextResponse.json({ error: "Please complete every required field." }, { status: 400 });
  }

  const result = await sendContactMessage(
    { name, email, subject, message, locale },
    getResendIdempotencyKey(request, "contact"),
  );
  return result.ok
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ error: result.error }, { status: result.status });
}
