import "server-only";
import { createHmac, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { parseCheckoutAttempt } from "../support-config";

export const CHECKOUT_ATTEMPT_LIFETIME_MS = 23 * 60 * 60 * 1000;
// Unconfigured local previews can render forms but cannot create Stripe Sessions.
const previewKey = randomBytes(32);
function signingKey() {
  return (
    process.env.SUPPORT_CHECKOUT_SECRET?.trim() ||
    process.env.STRIPE_RESTRICTED_KEY?.trim() ||
    process.env.STRIPE_SECRET_KEY?.trim() ||
    previewKey
  );
}
function signature(payload: string) {
  return createHmac("sha256", signingKey()).update(`support-checkout:v3:${payload}`).digest("base64url");
}
export function createCheckoutAttempt() {
  const payload = `v3.${randomUUID()}.${Date.now() + CHECKOUT_ATTEMPT_LIFETIME_MS}`;
  return `${payload}.${signature(payload)}`;
}
export function isValidCheckoutAttempt(value: string, now = Date.now()) {
  if (!parseCheckoutAttempt(value) || !value.startsWith("v3.")) return false;
  const [version, id, deadline, mac] = value.split(".");
  const expiresAt = Number(deadline);
  if (expiresAt <= now || expiresAt > now + CHECKOUT_ATTEMPT_LIFETIME_MS + 60_000) return false;
  const expected = Buffer.from(signature(`${version}.${id}.${deadline}`));
  const received = Buffer.from(mac!);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export class RetiredCheckoutAttemptError extends Error {
  constructor() {
    super("Checkout attempt is invalid or expired.");
    this.name = "RetiredCheckoutAttemptError";
  }
}
