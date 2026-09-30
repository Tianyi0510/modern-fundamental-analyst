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
