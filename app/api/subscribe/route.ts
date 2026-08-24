import { NextResponse } from "next/server";
import { getMemos } from "@/data/memos";
import { cleanText, createRateLimiter, isSameOrigin, isValidEmail, readLimitedJson, RequestBodyError } from "@/lib/api-request";
import { localeConfig, locales, type Locale } from "@/lib/i18n";
import { getResendClient } from "@/lib/resend";
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
  const requestedLocale = cleanText(body.locale, 10);
  const locale: Locale = locales.includes(requestedLocale as Locale) ? requestedLocale as Locale : "en";
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
  const result = existing.data
    ? await resend.contacts.update({ id: existing.data.id, unsubscribed: false, properties })
    : existing.error?.statusCode === 404
      ? await resend.contacts.create({ email, unsubscribed: false, properties })
      : existing;

  if (result.error) {
    console.error("Resend subscription failed", result.error.name);
    return NextResponse.json({ error: "Subscription could not be completed." }, { status: 502 });
  }

  if (shouldSendWelcome) {
    const latestMemo = getMemos(locale)[0];
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
