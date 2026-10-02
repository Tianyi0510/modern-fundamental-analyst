import "server-only";
import type { SupportProductId } from "../support-config";

// Keep released versions immutable, including names and tax classification:
// every retry must recreate identical Stripe parameters. New terms need a new version.
// The live Support product's name and tax code were verified read-only on 2026-10-02.
export const SUPPORT_CATALOG = [
  { id: "support-6-v1", currency: "usd", unitAmount: 600, name: "Support", taxCode: "txcd_10000000" },
  { id: "support-12-v1", currency: "usd", unitAmount: 1200, name: "Support", taxCode: "txcd_10000000" },
  { id: "support-18-v1", currency: "usd", unitAmount: 1800, name: "Support", taxCode: "txcd_10000000" },
] as const;

export function getSupportProduct(id: SupportProductId) {
  const product = SUPPORT_CATALOG.find((entry) => entry.id === id);
  if (!product) throw new Error("Unknown support product");
  return product;
}
