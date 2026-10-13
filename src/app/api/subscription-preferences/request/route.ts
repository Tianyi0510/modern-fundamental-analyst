import { NextResponse } from "next/server";
import { cleanText, isValidEmail, normalizeEmail, readProtectedObjectJson } from "@/lib/api-request";
import { resolveLocale } from "@/lib/i18n";
import { createRateLimiter } from "@/lib/rate-limit";
import { getResendIdempotencyKey } from "@/lib/resend";
import { requestPreferenceLink } from "@/features/subscriptions/server/request-preference-link";
import { randomUUID } from "node:crypto";

export const runtime = "nodejs";
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const isRateLimited = createRateLimiter({
  namespace: "subscription-preferences-request",
  windowMs: RATE_LIMIT_WINDOW_MS,
  maxRequests: 5,
});

export async function POST(request: Request) {
  const parsed = await readProtectedObjectJson(request, {
    isRateLimited,
    maxBytes: 5_000,
    rateLimitWindowMs: RATE_LIMIT_WINDOW_MS,
  });
  if (!parsed.ok) return parsed.response;
  const { body } = parsed;

  const email = normalizeEmail(body.email);
  const locale = resolveLocale(cleanText(body.locale, 10));
  if (!isValidEmail(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });

  const result = await requestPreferenceLink(
    email,
    locale,
    getResendIdempotencyKey(request, "preferences") ?? `preferences/${randomUUID()}`,
  );
  if (result.ok) return NextResponse.json({ ok: true });
  return NextResponse.json(
    {
      error:
        result.reason === "unavailable"
          ? "Email service is temporarily unavailable."
          : "Unable to process this request. Please try again.",
    },
    { status: result.status },
  );
}
