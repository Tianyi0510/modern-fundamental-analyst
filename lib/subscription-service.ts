import { getLatestMemo } from "@/data/memos";
import { localeConfig, type Locale } from "@/lib/i18n";
import { getResendClient, runResendOperation } from "@/lib/resend";
import { getPreferredLanguageSegmentId, syncPreferredLanguageSegment } from "@/lib/resend-segments";
import { SITE_URL } from "@/lib/site-config";
import { createPreferenceUrl } from "@/lib/subscription-preferences";

export type SubscriptionResult =
  | { ok: true }
  | { ok: false; message: string; status: 502 | 503 };

const unavailable = (status: 502 | 503 = 502): SubscriptionResult => ({
  ok: false,
  message: "Subscription could not be completed.",
  status,
});

export async function subscribeContact(email: string, locale: Locale): Promise<SubscriptionResult> {
  const resend = getResendClient();
  if (!resend) {
    console.error("Subscribe is missing RESEND_API_KEY.");
    return { ok: false, message: "Subscription service is temporarily unavailable.", status: 503 };
  }

  const existing = await runResendOperation("Resend contact lookup failed", () => resend.contacts.get({ email }));
  if (!existing) return unavailable();

  const shouldSendWelcome = !existing.data || existing.data.unsubscribed;
  const properties = { preferred_language: localeConfig[locale].label };
  let result;
  let rollbackLanguageSegments: (() => Promise<void>) | null = null;

  if (existing.data) {
    try {
      rollbackLanguageSegments = await syncPreferredLanguageSegment(resend, email, locale);
    } catch (error) {
      console.error("Resend language segment sync failed", error instanceof Error ? error.message : "UnknownError");
      return unavailable();
    }
    result = await runResendOperation("Resend contact update failed", () => resend.contacts.update({
      id: existing.data.id,
      unsubscribed: false,
      properties,
    }));
  } else if (existing.error?.statusCode === 404) {
    result = await runResendOperation("Resend contact creation failed", () => resend.contacts.create({
      email,
      unsubscribed: false,
      properties,
      segments: [{ id: getPreferredLanguageSegmentId(locale) }],
    }));
  } else {
    result = existing;
  }

  if (!result || result.error) {
    if (rollbackLanguageSegments) await rollbackLanguageSegments().catch(() => undefined);
    if (result?.error) console.error("Resend subscription failed", result.error.name);
    return unavailable();
  }

  if (!shouldSendWelcome) return { ok: true };

  const latestMemo = getLatestMemo(locale);
  const contactId = result.data?.id ?? existing.data?.id;
  if (!latestMemo) {
    if (contactId) await runResendOperation("Resend subscription rollback failed", () => resend.contacts.update({ id: contactId, unsubscribed: true }));
    console.error("Welcome automation requires at least one investment memo.");
    return unavailable(503);
  }

  const prefix = localeConfig[locale].prefix;
  const welcome = await runResendOperation("Resend welcome automation request failed", () => resend.events.send({
    event: "subscriber.created",
    email,
    payload: {
      locale,
      memo_title: latestMemo.title,
      memo_summary: latestMemo.summary,
      memo_url: `${SITE_URL}${prefix}/memos/${latestMemo.slug}`,
      preferences_url: createPreferenceUrl(email, locale),
    },
  }));

  if (!welcome || welcome.error) {
    if (contactId) await runResendOperation("Resend subscription rollback failed", () => resend.contacts.update({ id: contactId, unsubscribed: true }));
    if (welcome?.error) console.error("Resend welcome automation failed", welcome.error.name);
    return unavailable();
  }

  return { ok: true };
}
