import { NextResponse } from "next/server";
import { cleanText, readProtectedObjectJson } from "@/lib/api-request";
import { locales, resolveLocale } from "@/lib/i18n";
import { createRateLimiter } from "@/lib/rate-limit";
import { readPreferenceToken } from "@/features/subscriptions/server/subscription-preferences";
import { updateSubscriptionPreferences } from "@/features/subscriptions/server/update-subscription-preferences";

export const runtime = "nodejs";

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const isRateLimited = createRateLimiter({
  namespace: "subscription-preferences",
  windowMs: RATE_LIMIT_WINDOW_MS,
  maxRequests: 10,
});

export async function POST(request: Request) {
  const parsed = await readProtectedObjectJson(request, {
    isRateLimited,
    maxBytes: 5_000,
    rateLimitWindowMs: RATE_LIMIT_WINDOW_MS,
  });
  if (!parsed.ok) return parsed.response;
  const { body } = parsed;

  const action = cleanText(body.action, 20);
  const requestedLocale = cleanText(body.locale, 10);
  const token = cleanText(body.token, 2_000);
  const payload = readPreferenceToken(token);
  if (!payload || (action !== "save" && action !== "unsubscribe")) {
    return NextResponse.json({ error: "This preferences link is invalid or has expired." }, { status: 400 });
  }

  if (action === "save" && !locales.some((locale) => locale === requestedLocale)) {
    return NextResponse.json({ error: "Choose a valid language." }, { status: 400 });
  }
  const locale = resolveLocale(requestedLocale);
  const result = await updateSubscriptionPreferences(payload, locale, action);
  return result.ok
    ? NextResponse.json({ ok: true, action: result.action })
    : NextResponse.json({ error: result.error }, { status: result.status });
}
