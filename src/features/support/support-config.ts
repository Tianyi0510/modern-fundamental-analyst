import { resolveLocale, type Locale } from "@/lib/i18n";

export const SUPPORT_AMOUNTS = [6, 12, 18] as const;
export type SupportAmount = (typeof SUPPORT_AMOUNTS)[number];
export const SUPPORT_PRODUCT_IDS = ["support-6-v1", "support-12-v1", "support-18-v1"] as const;
export type SupportProductId = (typeof SUPPORT_PRODUCT_IDS)[number];
export function parseSupportProductId(value: string | null): SupportProductId | null {
  return SUPPORT_PRODUCT_IDS.find((id) => id === value) ?? null;
}
export type SupportStatus =
  | "success"
  | "pending"
  | "unverified"
  | "cancelled"
  | "error"
  | "rate-limited"
  | "invalid-amount"
  | "retired-checkout"
  | undefined;

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
  let status = ["success", "cancelled", "error", "rate-limited", "invalid-amount", "retired-checkout"].find(
    (value) => value === params.status,
  );
  const sessionId =
    typeof params.session_id === "string" && /^cs_(test|live)_[A-Za-z0-9]{1,240}$/.test(params.session_id)
      ? params.session_id
      : undefined;
  const attemptId = parseCheckoutAttempt(typeof params.checkout_attempt === "string" ? params.checkout_attempt : null);
  const productId = parseSupportProductId(typeof params.product_id === "string" ? params.product_id : null);
  // Legacy attempts cannot be converted to a new pricing contract under an old key.
  if ((status === "error" || status === "rate-limited") && attemptId && params.product_id === undefined)
    status = "retired-checkout";
  const checkoutLocale = resolveLocale(params.checkout_locale, locale);
  const query = new URLSearchParams();
  if (status) query.set("status", status);
  if (status === "success" && sessionId) query.set("session_id", sessionId);
  const recovering = (status === "error" || status === "rate-limited") && attemptId && productId;
  if (recovering) {
    query.set("checkout_attempt", attemptId);
    query.set("product_id", productId);
    query.set("checkout_locale", checkoutLocale);
  }
  return {
    status,
    session_id: sessionId,
    languageQuery: query.toString(),
    attemptId: recovering ? attemptId : undefined,
    productId: recovering ? productId : null,
    checkoutLocale: recovering ? checkoutLocale : locale,
  };
}
