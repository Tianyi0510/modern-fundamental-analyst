import "server-only";
import { hasProviderId, isResendWriteAcknowledged } from "@/lib/resend-contracts";
import type { Locale } from "@/lib/i18n";
import { getResendClient, runResendOperation, UPDATES_FROM_EMAIL } from "@/lib/resend";
import { renderPreferenceEmail } from "../preference-email";
import { preferenceEmailCopy } from "../preference-email-copy";
import { createPreferenceUrl } from "./subscription-preferences";
import { getStablePreferenceEmail, ResendCoordinationError } from "./resend-coordination";
import { requireRecipientAllowance } from "./recipient-delivery";

export async function requestPreferenceLink(email: string, locale: Locale, idempotencyKey: string) {
  const resend = getResendClient();
  if (!resend) return { ok: false as const, reason: "unavailable" as const, status: 503 };

  try {
    await requireRecipientAllowance(email, idempotencyKey);
    const emailPayload = await getStablePreferenceEmail(
      idempotencyKey,
      JSON.stringify({ email, locale }),
      email,
      async () => {
        const text = preferenceEmailCopy[locale];
        const preferencesUrl = createPreferenceUrl(email, locale, 30 * 60 * 1000);
        return {
          from: UPDATES_FROM_EMAIL,
          to: email,
          subject: text.subject,
          text: `${text.heading}\n\n${text.body}\n\n${preferencesUrl}\n\n${text.note}`,
          html: await renderPreferenceEmail(text, preferencesUrl, locale),
        };
      },
    );
    const existing = await runResendOperation(
      "Preference link contact lookup failed",
      () => resend.contacts.get({ email }),
      { expectedStatuses: [404] },
    );
    if (!existing) throw new ResendCoordinationError();
    if (!existing.error && hasProviderId(existing.data)) {
      const result = await runResendOperation("Preference link email request failed", () =>
        resend.emails.send(emailPayload, { idempotencyKey }),
      );
      if (!result || result.error || !isResendWriteAcknowledged(result.data)) throw new ResendCoordinationError();
    } else if (existing.error?.statusCode !== 404) {
      console.error("Preference link contact lookup failed", existing.error?.name ?? "UnknownError");
      throw new ResendCoordinationError();
    }

    return { ok: true as const };
  } catch (error) {
    return {
      ok: false as const,
      reason: "failed" as const,
      status: error instanceof ResendCoordinationError ? error.status : 503,
    };
  }
}
