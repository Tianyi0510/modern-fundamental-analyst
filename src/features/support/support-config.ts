import { resolveLocale, type Locale } from "@/lib/i18n";

export const SUPPORT_AMOUNTS = [6, 12, 18] as const;
export type SupportAmount = (typeof SUPPORT_AMOUNTS)[number];
export type SupportStatus =
  "success" | "pending" | "unverified" | "cancelled" | "error" | "rate-limited" | "invalid-amount" | undefined;

const amounts = new Map(SUPPORT_AMOUNTS.map((amount) => [String(amount), amount] as const));
export function parseSupportAmount(value: string | null): SupportAmount | null {
  return value ? (amounts.get(value) ?? null) : null;
}

export function parseCheckoutAttempt(value: string | null): string | undefined {
  return value && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
    ? value
    : undefined;
}

export type SupportSearchParams = Record<string, string | string[] | undefined>;

export function parseSupportSearchParams(params: SupportSearchParams, locale: Locale) {
  const status = ["success", "cancelled", "error", "rate-limited", "invalid-amount"].find(
    (value) => value === params.status,
  );
  const sessionId =
    typeof params.session_id === "string" && /^cs_(test|live)_[A-Za-z0-9]{1,240}$/.test(params.session_id)
      ? params.session_id
      : undefined;
  const attemptId = parseCheckoutAttempt(typeof params.checkout_attempt === "string" ? params.checkout_attempt : null);
  const amount = parseSupportAmount(typeof params.amount === "string" ? params.amount : null);
  const checkoutLocale = resolveLocale(params.checkout_locale, locale);
  const query = new URLSearchParams();
  if (status) query.set("status", status);
  if (status === "success" && sessionId) query.set("session_id", sessionId);
  const recovering = (status === "error" || status === "rate-limited") && attemptId && amount;
  if (recovering) {
    query.set("checkout_attempt", attemptId);
    query.set("amount", String(amount));
    query.set("checkout_locale", checkoutLocale);
  }
  return {
    status,
    session_id: sessionId,
    languageQuery: query.toString(),
    attemptId: recovering ? attemptId : undefined,
    amount: recovering ? String(amount) : undefined,
    checkoutLocale: recovering ? checkoutLocale : locale,
  };
}
