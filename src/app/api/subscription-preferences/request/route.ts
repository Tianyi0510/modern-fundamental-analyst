import { NextResponse } from "next/server";
import { cleanText, isValidEmail, normalizeEmail, readProtectedObjectJson } from "@/lib/api-request";
import { renderPreferenceEmail } from "@/features/subscriptions/preference-email";
import { preferenceEmailCopy } from "@/features/subscriptions/preference-email-copy";
import { resolveLocale } from "@/lib/i18n";
import { createRateLimiter } from "@/lib/rate-limit";
import { getResendClient, getResendIdempotencyKey, runResendOperation, UPDATES_FROM_EMAIL } from "@/lib/resend";
import { createPreferenceUrl } from "@/features/subscriptions/server/subscription-preferences";
import { getStablePreferenceEmail, ResendCoordinationError } from "@/features/subscriptions/server/resend-coordination";
import { randomUUID } from "node:crypto";

export const runtime = "nodejs";
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const isRateLimited = createRateLimiter({
  namespace: "subscription-preferences-request",
  windowMs: RATE_LIMIT_WINDOW_MS,
  maxRequests: 5,
});

export async function POST(request: Request) {
  const parsed = await readProtectedObjectJson(request, {
    isRateLimited,
    maxBytes: 5_000,
    rateLimitWindowMs: RATE_LIMIT_WINDOW_MS,
  });
  if (!parsed.ok) return parsed.response;
  const { body } = parsed;

  const email = normalizeEmail(body.email);
  const locale = resolveLocale(cleanText(body.locale, 10));
  if (!isValidEmail(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });

  const resend = getResendClient();
  if (!resend) return NextResponse.json({ error: "Email service is temporarily unavailable." }, { status: 503 });

  try {
    const idempotencyKey = getResendIdempotencyKey(request, "preferences") ?? `preferences/${randomUUID()}`;
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
    const existing = await runResendOperation("Preference link contact lookup failed", () =>
      resend.contacts.get({ email }),
    );
    if (!existing) throw new ResendCoordinationError();
    if (existing.data) {
      const result = await runResendOperation("Preference link email request failed", () =>
        resend.emails.send(emailPayload, { idempotencyKey }),
      );
      if (!result || result.error) throw new ResendCoordinationError();
    } else if (existing.error?.statusCode !== 404) {
      console.error("Preference link contact lookup failed", existing.error?.name ?? "UnknownError");
      throw new ResendCoordinationError();
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const status = error instanceof ResendCoordinationError ? error.status : 503;
    return NextResponse.json({ error: "Unable to process this request. Please try again." }, { status });
  }
}
