import { NextResponse } from "next/server";
import { cleanText, isValidEmail, normalizeEmail, readProtectedObjectJson } from "@/lib/api-request";
import { resolveLocale } from "@/lib/i18n";
import { createRateLimiter } from "@/lib/rate-limit";
import { randomUUID } from "node:crypto";
import { getResendIdempotencyKey } from "@/lib/resend";
import { requestSubscriptionConfirmation } from "@/features/subscriptions/server/subscription-confirmation";
import { ResendCoordinationError } from "@/features/subscriptions/server/resend-coordination";

export const runtime = "nodejs";

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const isRateLimited = createRateLimiter({ namespace: "subscribe", windowMs: RATE_LIMIT_WINDOW_MS, maxRequests: 5 });

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
  const website = cleanText(body.website, 200);
  if (website) return NextResponse.json({ ok: true });
  if (!isValidEmail(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });

  try {
    await requestSubscriptionConfirmation(
      email,
      locale,
      getResendIdempotencyKey(request, "subscribe") ?? `subscribe/${randomUUID()}`,
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    const duplicate = error instanceof ResendCoordinationError && error.message === "You've already subscribed";
    const originalStatus = error instanceof ResendCoordinationError ? error.status : 503;
    const status = originalStatus === 409 && !duplicate ? 422 : originalStatus;
    return NextResponse.json(
      { error: status === 409 ? "You've already subscribed" : "Subscription could not be completed." },
      { status },
    );
  }
}
