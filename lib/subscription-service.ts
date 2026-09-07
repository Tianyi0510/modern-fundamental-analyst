import { getLatestMemo } from "@/data/memos";
import { localeConfig, type Locale } from "@/lib/i18n";
import { getResendClient, reportResendRollbackFailure, runResendOperation } from "@/lib/resend";
import { getPreferredLanguageSegmentId, syncPreferredLanguageSegment } from "@/lib/resend-segments";
import { SITE_URL } from "@/lib/site-config";
import { createPreferenceUrl } from "@/lib/subscription-preferences";
import { withSubscriberLock } from "@/lib/resend-coordination";

export type SubscriptionResult =
  | { ok: true }
  | { ok: false; message: string; status: 502 | 503 };

const unavailable = (status: 502 | 503 = 502): SubscriptionResult => ({
  ok: false,
  message: "Subscription could not be completed.",
  status,
});

type ResendClient = NonNullable<ReturnType<typeof getResendClient>>;

async function rollbackSubscription(resend: ResendClient, contactId: string | undefined, rollbackLanguageSegments: (() => Promise<void>) | null, previousLanguage: string | number | null) {
  await Promise.all([
    contactId
      ? runResendOperation("Resend subscription rollback failed", () => resend.contacts.update({ id: contactId, unsubscribed: true, properties: { preferred_language: previousLanguage } }))
        .then((result) => { if (!result || result.error) reportResendRollbackFailure(); })
      : Promise.resolve(null),
    rollbackLanguageSegments ? rollbackLanguageSegments().catch(() => undefined) : Promise.resolve(),
  ]);
}

export async function subscribeContact(email: string, locale: Locale): Promise<SubscriptionResult> {
  try {
    return await withSubscriberLock(email, () => subscribeContactLocked(email, locale));
  } catch {
    return unavailable(503);
  }
}

async function subscribeContactLocked(email: string, locale: Locale): Promise<SubscriptionResult> {
  const resend = getResendClient();
  if (!resend) {
    console.error("Subscribe is missing RESEND_API_KEY.");
    return { ok: false, message: "Subscription service is temporarily unavailable.", status: 503 };
  }

  const existing = await runResendOperation("Resend contact lookup failed", () => resend.contacts.get({ email }));
  if (!existing) return unavailable();

  const shouldSendWelcome = !existing.data || existing.data.unsubscribed;
  const latestMemo = shouldSendWelcome ? getLatestMemo(locale) : null;
  if (shouldSendWelcome && !latestMemo) {
    console.error("Welcome automation requires at least one investment memo.");
    return unavailable(503);
  }
  const previousLanguage = existing.data?.properties?.preferred_language?.value ?? null;
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
    if (!shouldSendWelcome && previousLanguage === properties.preferred_language) return { ok: true };
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

  const contactId = result.data?.id ?? existing.data?.id;
  if (!latestMemo) return unavailable(503);

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
    await rollbackSubscription(resend, contactId, rollbackLanguageSegments, previousLanguage);
    if (welcome?.error) console.error("Resend welcome automation failed", welcome.error.name);
    return unavailable();
  }

  return { ok: true };
}
