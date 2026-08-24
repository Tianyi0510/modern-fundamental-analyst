import { NextResponse } from "next/server";
import { cleanText, createRateLimiter, isSameOrigin, readLimitedJson, RequestBodyError } from "@/lib/api-request";
import { localeConfig, locales, type Locale } from "@/lib/i18n";
import { getResendClient } from "@/lib/resend";
import { getLocaleFromPreferredLanguage, syncPreferredLanguageSegment } from "@/lib/resend-segments";
import { readPreferenceToken } from "@/lib/subscription-preferences";

export const runtime = "nodejs";

const isRateLimited = createRateLimiter({ namespace: "subscription-preferences", windowMs: 10 * 60 * 1000, maxRequests: 10 });

type PreferenceRequest = {
  action?: unknown;
  locale?: unknown;
  token?: unknown;
};

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (await isRateLimited(request)) return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });

  let body: PreferenceRequest;
  try {
    const payload = await readLimitedJson(request, 5_000);
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new Error("Invalid payload");
    body = payload as PreferenceRequest;
  } catch (error) {
    const status = error instanceof RequestBodyError ? error.status : 400;
    return NextResponse.json({ error: error instanceof RequestBodyError ? error.message : "Invalid request." }, { status });
  }

  const action = cleanText(body.action, 20);
  const requestedLocale = cleanText(body.locale, 10);
  const token = cleanText(body.token, 2_000);
  const payload = readPreferenceToken(token);
  if (!payload || (action !== "save" && action !== "unsubscribe")) {
    return NextResponse.json({ error: "This preferences link is invalid or has expired." }, { status: 400 });
  }

  const locale: Locale = locales.includes(requestedLocale as Locale) ? requestedLocale as Locale : "en";
  const resend = getResendClient();
  if (!resend) return NextResponse.json({ error: "Subscription service is temporarily unavailable." }, { status: 503 });

  const existing = await resend.contacts.get({ email: payload.email });
  if (!existing.data) return NextResponse.json({ error: "Subscription preferences could not be found." }, { status: 404 });

  if (action === "save") {
    const previousLocale = getLocaleFromPreferredLanguage(existing.data.properties.preferred_language?.value);
    try {
      await syncPreferredLanguageSegment(resend, payload.email, locale);
    } catch (error) {
      console.error("Resend language segment sync failed", error instanceof Error ? error.message : "UnknownError");
      return NextResponse.json({ error: "Subscription preferences could not be updated." }, { status: 502 });
    }

    const result = await resend.contacts.update({
      email: payload.email,
      properties: { preferred_language: localeConfig[locale].label },
    });
    if (result.error) {
      await syncPreferredLanguageSegment(resend, payload.email, previousLocale).catch(() => undefined);
      console.error("Resend preferences update failed", result.error.name);
      return NextResponse.json({ error: "Subscription preferences could not be updated." }, { status: 502 });
    }
  } else {
    const result = await resend.contacts.update({ email: payload.email, unsubscribed: true });
    if (result.error) {
      console.error("Resend preferences update failed", result.error.name);
      return NextResponse.json({ error: "Subscription preferences could not be updated." }, { status: 502 });
    }
  }

  return NextResponse.json({ ok: true, action });
}
