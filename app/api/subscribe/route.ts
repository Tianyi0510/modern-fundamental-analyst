import { NextResponse } from "next/server";
import { getLatestMemo } from "@/data/memos";
import { cleanText, createRateLimiter, isSameOrigin, isValidEmail, readLimitedJson, RequestBodyError } from "@/lib/api-request";
import { localeConfig, resolveLocale } from "@/lib/i18n";
import { getResendClient } from "@/lib/resend";
import { getPreferredLanguageSegmentId, syncPreferredLanguageSegment } from "@/lib/resend-segments";
import { SITE_URL } from "@/lib/site-config";
import { createPreferenceUrl } from "@/lib/subscription-preferences";

export const runtime = "nodejs";

const isRateLimited = createRateLimiter({ namespace: "subscribe", windowMs: 10 * 60 * 1000, maxRequests: 5 });

type SubscribeRequest = {
  email?: unknown;
  locale?: unknown;
  website?: unknown;
};

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (await isRateLimited(request)) return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });

  let body: SubscribeRequest;
  try {
    const payload = await readLimitedJson(request, 5_000);
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new Error("Invalid payload");
    body = payload as SubscribeRequest;
  } catch (error) {
    const status = error instanceof RequestBodyError ? error.status : 400;
    const message = error instanceof RequestBodyError ? error.message : "Invalid request.";
    return NextResponse.json({ error: message }, { status });
  }

  const email = cleanText(body.email, 254).toLowerCase();
  const locale = resolveLocale(cleanText(body.locale, 10));
  const website = cleanText(body.website, 200);
  if (website) return NextResponse.json({ ok: true });
  if (!isValidEmail(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });

  const resend = getResendClient();
  if (!resend) {
    console.error("Subscribe is missing RESEND_API_KEY.");
    return NextResponse.json({ error: "Subscription service is temporarily unavailable." }, { status: 503 });
  }

  const existing = await resend.contacts.get({ email });
  const shouldSendWelcome = !existing.data || existing.data.unsubscribed;
  const properties = { preferred_language: localeConfig[locale].label };
  let result;
  if (existing.data) {
    try {
      await syncPreferredLanguageSegment(resend, email, locale);
    } catch (error) {
      console.error("Resend language segment sync failed", error instanceof Error ? error.message : "UnknownError");
      return NextResponse.json({ error: "Subscription could not be completed." }, { status: 502 });
    }
    result = await resend.contacts.update({ id: existing.data.id, unsubscribed: false, properties });
  } else if (existing.error?.statusCode === 404) {
    result = await resend.contacts.create({
      email,
      unsubscribed: false,
      properties,
      segments: [{ id: getPreferredLanguageSegmentId(locale) }],
    });
  } else {
    result = existing;
  }

  if (result.error) {
    console.error("Resend subscription failed", result.error.name);
    return NextResponse.json({ error: "Subscription could not be completed." }, { status: 502 });
  }

  if (shouldSendWelcome) {
    const latestMemo = getLatestMemo(locale);
    if (!latestMemo) {
      const contactId = result.data?.id ?? existing.data?.id;
      if (contactId) await resend.contacts.update({ id: contactId, unsubscribed: true });
      console.error("Welcome automation requires at least one investment memo.");
      return NextResponse.json({ error: "Subscription could not be completed." }, { status: 503 });
    }
    const prefix = localeConfig[locale].prefix;
    const preferencesUrl = createPreferenceUrl(email, locale);
    const welcome = await resend.events.send({
      event: "subscriber.created",
      email,
      payload: {
        locale,
        memo_title: latestMemo.title,
        memo_summary: latestMemo.summary,
        memo_url: `${SITE_URL}${prefix}/memos/${latestMemo.slug}`,
        preferences_url: preferencesUrl,
      },
    });

    if (welcome.error) {
      const contactId = result.data?.id ?? existing.data?.id;
      if (contactId) await resend.contacts.update({ id: contactId, unsubscribed: true });
      console.error("Resend welcome automation failed", welcome.error.name);
      return NextResponse.json({ error: "Subscription could not be completed." }, { status: 502 });
    }
  }

  return NextResponse.json({ ok: true });
}
