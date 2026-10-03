import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { getLocalizedPath, locales, type Locale } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site-config";
import { executeRedisCommand, getRedisClient } from "@/lib/redis";
import { getResendClient, resendOperationContext, runResendOperation, UPDATES_FROM_EMAIL } from "@/lib/resend";
import { confirmationCopy } from "../confirmation-copy";
import { renderPreferenceEmail } from "../preference-email";
import {
  getStablePreferenceEmail,
  ResendCoordinationError,
  subscriptionKey,
  withSubscriberLock,
} from "./resend-coordination";
import { isDeliverySuppressed, requireRecipientAllowance } from "./recipient-delivery";
import { activateConfirmedContactLocked, type WelcomeMemoProvider } from "./subscription-service";
import { withSubscriptionJournal } from "./subscription-journal";

const LIFETIME_SECONDS = 24 * 60 * 60;
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;
type Confirmation = {
  email: string;
  locale: Locale;
  expiresAt: number;
  status: "pending" | "processing" | "confirmed";
};
function tokenKey(token: string) {
  return `mfa:subscription-confirmation:v1:${createHash("sha256").update(token).digest("hex")}`;
}
function client() {
  const redis = getRedisClient();
  if (!redis) throw new ResendCoordinationError();
  return redis;
}
async function readConfirmation(token: string): Promise<Confirmation | null> {
  if (!TOKEN_PATTERN.test(token)) return null;
  const redis = client();
  const raw = await executeRedisCommand(redis, () => redis.get<string>(tokenKey(token)));
  if (!raw) return null;
  const value = JSON.parse(raw) as Confirmation;
  if (
    typeof value.email !== "string" ||
    !locales.includes(value.locale) ||
    !Number.isSafeInteger(value.expiresAt) ||
    value.expiresAt <= Date.now() ||
    !["pending", "processing", "confirmed"].includes(value.status)
  )
    return null;
  return value;
}

export async function requestSubscriptionConfirmation(email: string, locale: Locale, requestId: string) {
  const resend = getResendClient();
  if (!resend) throw new ResendCoordinationError();
  await requireRecipientAllowance(email, requestId);
  if (await isDeliverySuppressed(email)) return;
  const existing = await runResendOperation("Confirmation contact lookup failed", () => resend.contacts.get({ email }));
  if (!existing || (existing.error && existing.error.statusCode !== 404)) throw new ResendCoordinationError();
  if (existing.data && !existing.data.unsubscribed) throw new ResendCoordinationError("You've already subscribed", 409);

  const payload = await getStablePreferenceEmail(
    requestId,
    JSON.stringify({ email, locale, purpose: "confirm" }),
    email,
    async () => {
      const redis = client();
      const token = randomBytes(32).toString("base64url");
      const record: Confirmation = {
        email,
        locale,
        expiresAt: Date.now() + LIFETIME_SECONDS * 1000,
        status: "pending",
      };
      const copy = confirmationCopy[locale];
      const url = `${SITE_URL}${getLocalizedPath("/subscription-confirmation", locale)}?token=${token}`;
      const html = await renderPreferenceEmail(copy, url, locale);
      await executeRedisCommand(redis, () =>
        redis.set(tokenKey(token), JSON.stringify(record), { nx: true, ex: LIFETIME_SECONDS }),
      );
      return {
        from: UPDATES_FROM_EMAIL,
        to: email,
        subject: copy.subject,
        text: `${copy.heading}\n\n${copy.body}\n\n${url}\n\n${copy.note}`,
        html,
      };
    },
  );
  const result = await runResendOperation("Confirmation email request failed", () =>
    resend.emails.send(payload, { idempotencyKey: requestId }),
  );
  if (!result || result.error) throw new ResendCoordinationError();
}

// GET renders only a confirmation button. Token consumption and all provider
// mutations require this explicit POST, so email scanners cannot activate users.
export async function confirmSubscription(token: string, getWelcomeMemo: WelcomeMemoProvider) {
  const initial = await readConfirmation(token);
  if (!initial) throw new ResendCoordinationError("Invalid confirmation link", 400);
  return withSubscriberLock(initial.email, async () => {
    const record = await readConfirmation(token);
    if (!record) throw new ResendCoordinationError("Invalid confirmation link", 400);
    if (record.status === "confirmed") return;
    if (record.status === "processing") throw new ResendCoordinationError();
    if (await isDeliverySuppressed(record.email)) throw new ResendCoordinationError("Delivery is suppressed", 403);
    const redis = client();
    const save = async (status: Confirmation["status"]) => {
      const ttl = Math.max(1, Math.ceil((record.expiresAt - Date.now()) / 1000));
      await executeRedisCommand(redis, () =>
        redis.set(tokenKey(token), JSON.stringify({ ...record, status }), { ex: ttl }),
      );
    };
    // A crash must not allow this token to reactivate a subsequently unsubscribed
    // contact. Ambiguous processing is reconciled alongside the durable journal.
    await save("processing");
    try {
      await executeRedisCommand(redis, () =>
        redis.set(
          subscriptionKey("consent", record.email),
          JSON.stringify({
            confirmedAt: new Date().toISOString(),
            locale: record.locale,
            policy: "research-updates-v1",
            confirmationId: tokenKey(token),
          }),
        ),
      );
      const result = await withSubscriptionJournal(record.email, record.locale, () =>
        activateConfirmedContactLocked(record.email, record.locale, getWelcomeMemo),
      );
      if (!result.ok && result.status !== 409) {
        if (!resendOperationContext.getStore()?.uncertain) await save("pending");
        throw new ResendCoordinationError();
      }
      await save("confirmed");
    } catch (error) {
      const context = resendOperationContext.getStore();
      if (!context?.writeStarted && !context?.uncertain) await save("pending");
      throw error;
    }
  });
}
