import { getLatestMemo } from "@/features/memos/memos";
import { NextResponse } from "next/server";
import { cleanText, isValidEmail, normalizeEmail, readProtectedObjectJson } from "@/lib/api-request";
import { resolveLocale } from "@/lib/i18n";
import { createRateLimiter } from "@/lib/rate-limit";
import { subscribeContact } from "@/features/subscriptions/server/subscription-service";

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

  const result = await subscribeContact(email, locale, getLatestMemo);
  return result.ok
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ error: result.message }, { status: result.status });
}
