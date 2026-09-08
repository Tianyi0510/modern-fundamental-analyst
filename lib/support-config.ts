export const SUPPORT_AMOUNTS = [6, 12, 18] as const;
export type SupportAmount = (typeof SUPPORT_AMOUNTS)[number];
export type SupportStatus = "success" | "pending" | "unverified" | "cancelled" | "error" | undefined;

const amounts = new Map(SUPPORT_AMOUNTS.map(amount => [String(amount), amount] as const));
export function parseSupportAmount(value: string | null): SupportAmount | null {
  return value ? amounts.get(value) ?? null : null;
}
