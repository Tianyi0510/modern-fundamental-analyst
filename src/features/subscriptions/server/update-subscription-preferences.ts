import "server-only";
import { localeConfig, type Locale } from "@/lib/i18n";
import { getResendClient, runResendOperation, resendOperationContext } from "@/lib/resend";
import { syncPreferredLanguageSegment } from "./resend-segments";
import { withSubscriberLock } from "./resend-coordination";
import { withSubscriptionJournal } from "./subscription-journal";
import type { PreferencesAction } from "../subscription-contract";

type PreferencesUpdateResult =
  { ok: true; action: PreferencesAction } | { ok: false; error: string; status: 404 | 502 | 503 };

export async function updateSubscriptionPreferences(
  payload: { email: string },
  locale: Locale,
  action: PreferencesAction,
): Promise<PreferencesUpdateResult> {
  const resend = getResendClient();
  if (!resend) return { ok: false, error: "Subscription service is temporarily unavailable.", status: 503 };
  try {
    return await withSubscriberLock(payload.email, () =>
      action === "save"
        ? withSubscriptionJournal(
            payload.email,
            locale,
            () => updatePreferencesLocked(resend, payload, locale, action),
            "preferences",
          )
        : updatePreferencesLocked(resend, payload, locale, action),
    );
  } catch {
    return { ok: false, error: "Subscription service is temporarily unavailable.", status: 503 };
  }
}

async function updatePreferencesLocked(
  resend: NonNullable<ReturnType<typeof getResendClient>>,
  payload: { email: string },
  locale: Locale,
  action: PreferencesAction,
): Promise<PreferencesUpdateResult> {
  const existing = await runResendOperation("Resend preferences contact lookup failed", () =>
    resend.contacts.get({ email: payload.email }),
  );
  if (!existing) return { ok: false, error: "Subscription service is temporarily unavailable.", status: 503 };
  if (!existing.data)
    return {
      ok: false,
      error: "Subscription preferences could not be found.",
      status: existing.error?.statusCode === 404 ? 404 : 502,
    };

  if (action === "save") {
    await resendOperationContext.getStore()?.recordPhase?.("sync-language-segments");
    let rollbackLanguageSegments: (() => Promise<void>) | null = null;
    try {
      rollbackLanguageSegments = await syncPreferredLanguageSegment(resend, payload.email, locale);
    } catch (error) {
      console.error("Resend language segment sync failed", error instanceof Error ? error.message : "UnknownError");
      return { ok: false, error: "Subscription preferences could not be updated.", status: 502 };
    }

    await resendOperationContext.getStore()?.recordPhase?.("update-preferred-language");
    const result = await runResendOperation("Resend preferences update request failed", () =>
      resend.contacts.update({
        email: payload.email,
        properties: { preferred_language: localeConfig[locale].label },
      }),
    );
    if (!result || result.error) {
      await resendOperationContext.getStore()?.recordPhase?.("rollback-language-segments");
      if (rollbackLanguageSegments) await rollbackLanguageSegments().catch(() => undefined);
      if (result?.error) console.error("Resend preferences update failed", result.error.name);
      return { ok: false, error: "Subscription preferences could not be updated.", status: 502 };
    }
  } else {
    const result = await runResendOperation("Resend unsubscribe request failed", () =>
      resend.contacts.update({ email: payload.email, unsubscribed: true }),
    );
    if (!result || result.error) {
      if (result?.error) console.error("Resend preferences update failed", result.error.name);
      return { ok: false, error: "Subscription preferences could not be updated.", status: 502 };
    }
  }

  return { ok: true, action };
}
