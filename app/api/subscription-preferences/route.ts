import { NextResponse } from "next/server";
import { cleanText, readProtectedObjectJson } from "@/lib/api-request";
import { localeConfig, resolveLocale } from "@/lib/i18n";
import { createRateLimiter } from "@/lib/rate-limit";
import { getResendClient, runResendOperation } from "@/lib/resend";
import { syncPreferredLanguageSegment } from "@/lib/resend-segments";
import { readPreferenceToken } from "@/lib/subscription-preferences";

export const runtime = "nodejs";

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const isRateLimited = createRateLimiter({ namespace: "subscription-preferences", windowMs: RATE_LIMIT_WINDOW_MS, maxRequests: 10 });

type PreferenceRequest = {
  action?: unknown;
  locale?: unknown;
  token?: unknown;
};

export async function POST(request: Request) {
  const parsed = await readProtectedObjectJson<PreferenceRequest>(request, {
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

  const locale = resolveLocale(requestedLocale);
  const resend = getResendClient();
  if (!resend) return NextResponse.json({ error: "Subscription service is temporarily unavailable." }, { status: 503 });

  const existing = await runResendOperation("Resend preferences contact lookup failed", () => resend.contacts.get({ email: payload.email }));
  if (!existing) return NextResponse.json({ error: "Subscription service is temporarily unavailable." }, { status: 503 });
  if (!existing.data) return NextResponse.json({ error: "Subscription preferences could not be found." }, { status: 404 });

  if (action === "save") {
    let rollbackLanguageSegments: (() => Promise<void>) | null = null;
    try {
      rollbackLanguageSegments = await syncPreferredLanguageSegment(resend, payload.email, locale);
    } catch (error) {
      console.error("Resend language segment sync failed", error instanceof Error ? error.message : "UnknownError");
      return NextResponse.json({ error: "Subscription preferences could not be updated." }, { status: 502 });
    }

    const result = await runResendOperation("Resend preferences update request failed", () => resend.contacts.update({
      email: payload.email,
      properties: { preferred_language: localeConfig[locale].label },
    }));
    if (!result || result.error) {
      if (rollbackLanguageSegments) await rollbackLanguageSegments().catch(() => undefined);
      if (result?.error) console.error("Resend preferences update failed", result.error.name);
      return NextResponse.json({ error: "Subscription preferences could not be updated." }, { status: 502 });
    }
  } else {
    const result = await runResendOperation("Resend unsubscribe request failed", () => resend.contacts.update({ email: payload.email, unsubscribed: true }));
    if (!result || result.error) {
      if (result?.error) console.error("Resend preferences update failed", result.error.name);
      return NextResponse.json({ error: "Subscription preferences could not be updated." }, { status: 502 });
    }
  }

  return NextResponse.json({ ok: true, action });
}
