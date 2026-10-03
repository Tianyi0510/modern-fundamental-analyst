import "server-only";
import { getLocalizedPath, localeConfig, type Locale } from "@/lib/i18n";
import { getResendClient, runResendOperation, resendOperationContext } from "@/lib/resend";
import { withSubscriptionJournal } from "@/features/subscriptions/server/subscription-journal";
import {
  getPreferredLanguageSegmentId,
  syncPreferredLanguageSegment,
} from "@/features/subscriptions/server/resend-segments";
import { SITE_URL } from "@/lib/site-config";
import { createPreferenceUrl } from "@/features/subscriptions/server/subscription-preferences";
import { withSubscriberLock } from "@/features/subscriptions/server/resend-coordination";

type SubscriptionResult = { ok: true } | { ok: false; message: string; status: 409 | 502 | 503 };

const unavailable = (status: 502 | 503 = 502): SubscriptionResult => ({
  ok: false,
  message: "Subscription could not be completed.",
  status,
});

export type WelcomeMemoProvider = (
  locale: Locale,
) => { title: string; summary: string; slug: string } | null | undefined;

export async function subscribeContact(
  email: string,
  locale: Locale,
  getWelcomeMemo: WelcomeMemoProvider,
): Promise<SubscriptionResult> {
  try {
    return await withSubscriberLock(email, () =>
      withSubscriptionJournal(email, locale, () => activateConfirmedContactLocked(email, locale, getWelcomeMemo)),
    );
  } catch {
    return unavailable(503);
  }
}

export async function activateConfirmedContactLocked(
  email: string,
  locale: Locale,
  getWelcomeMemo: WelcomeMemoProvider,
): Promise<SubscriptionResult> {
  if (!resendOperationContext.getStore()?.recordPhase) {
    throw new Error("Subscription activation requires a subscriber lock and journal");
  }
  const resend = getResendClient();
  if (!resend) {
    console.error("Subscribe is missing RESEND_API_KEY.");
    return { ok: false, message: "Subscription service is temporarily unavailable.", status: 503 };
  }

  const existing = await runResendOperation("Resend contact lookup failed", () => resend.contacts.get({ email }));
  if (!existing || (existing.error && existing.error.statusCode !== 404)) return unavailable();

  if (existing.data && !existing.data.unsubscribed) {
    return { ok: false, message: "You've already subscribed", status: 409 };
  }

  const shouldSendWelcome = !existing.data || existing.data.unsubscribed;
  const latestMemo = shouldSendWelcome ? getWelcomeMemo(locale) : null;
  if (shouldSendWelcome && !latestMemo) {
    console.error("Welcome automation requires at least one investment memo.");
    return unavailable(503);
  }
  const properties = { preferred_language: localeConfig[locale].label };
  let result;
  let rollbackLanguageSegments: (() => Promise<void>) | null = null;

  if (existing.data) {
    await resendOperationContext.getStore()?.recordPhase?.("sync-language-segments");
    try {
      rollbackLanguageSegments = await syncPreferredLanguageSegment(resend, email, locale);
    } catch (error) {
      console.error("Resend language segment sync failed", error instanceof Error ? error.message : "UnknownError");
      return unavailable();
    }
    await resendOperationContext.getStore()?.recordPhase?.("update-contact");
    result = await runResendOperation("Resend contact update failed", () =>
      resend.contacts.update({
        id: existing.data.id,
        unsubscribed: false,
        properties,
      }),
    );
  } else if (existing.error?.statusCode === 404) {
    await resendOperationContext.getStore()?.recordPhase?.("create-contact");
    result = await runResendOperation("Resend contact creation failed", () =>
      resend.contacts.create({
        email,
        unsubscribed: false,
        properties,
        segments: [{ id: getPreferredLanguageSegmentId(locale) }],
      }),
    );
  } else {
    result = existing;
  }

  if (!result || result.error) {
    if (rollbackLanguageSegments) await rollbackLanguageSegments().catch(() => undefined);
    if (result?.error) console.error("Resend subscription failed", result.error.name);
    return unavailable();
  }

  if (!latestMemo) return unavailable(503);

  await resendOperationContext.getStore()?.recordPhase?.("send-welcome-event");
  const welcome = await runResendOperation("Resend welcome automation request failed", () =>
    resend.events.send({
      event: "subscriber.created",
      email,
      payload: {
        locale,
        memo_title: latestMemo.title,
        memo_summary: latestMemo.summary,
        memo_url: `${SITE_URL}${getLocalizedPath(`/memos/${latestMemo.slug}`, locale)}`,
        preferences_url: createPreferenceUrl(email, locale),
      },
    }),
  );

  if (!welcome || welcome.error) {
    // Subscription consent survives delivery failure. Keep the durable journal
    // for operator reconciliation; never blindly replay an ambiguous event.
    const context = resendOperationContext.getStore();
    if (context) context.uncertain = true;
    if (welcome?.error) console.error("Resend welcome automation pending", welcome.error.name);
  }

  return { ok: true };
}
