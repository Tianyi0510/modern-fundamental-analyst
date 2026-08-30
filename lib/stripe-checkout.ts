import Stripe from "stripe";
import type { Locale } from "@/lib/i18n";

export const SUPPORT_AMOUNTS = [6, 12, 18] as const;

export type SupportAmount = (typeof SUPPORT_AMOUNTS)[number];

const PRICE_ENV_BY_AMOUNT: Record<SupportAmount, string> = {
  6: "STRIPE_PRICE_USD_6",
  12: "STRIPE_PRICE_USD_12",
  18: "STRIPE_PRICE_USD_18",
};

const CHECKOUT_INTEGRATION_IDENTIFIER = "hosted_web_0001_mfaqxkpt";
const STRIPE_API_VERSION = "2026-07-29.dahlia" as const;

const SUPPORT_AMOUNT_BY_VALUE = new Map(
  SUPPORT_AMOUNTS.map((amount) => [String(amount), amount] as const),
);

let stripeClient: Stripe | undefined;

export function parseSupportAmount(value: string | null): SupportAmount | null {
  return value ? SUPPORT_AMOUNT_BY_VALUE.get(value) ?? null : null;
}

function getStripeClient() {
  if (stripeClient) return stripeClient;

  const apiKey = process.env.STRIPE_RESTRICTED_KEY?.trim() || process.env.STRIPE_SECRET_KEY?.trim();
  if (!apiKey) throw new Error("A Stripe server API key is not configured.");

  stripeClient = new Stripe(apiKey, {
    apiVersion: STRIPE_API_VERSION,
    maxNetworkRetries: 2,
    timeout: 10_000,
  });
  return stripeClient;
}

function getPriceId(amount: SupportAmount) {
  const environmentVariable = PRICE_ENV_BY_AMOUNT[amount];
  const priceId = process.env[environmentVariable]?.trim();
  if (!priceId?.startsWith("price_")) {
    throw new Error(`${environmentVariable} is not configured with a Stripe Price ID.`);
  }
  return priceId;
}

export async function createSupportCheckoutSession({
  amount,
  locale,
  origin,
}: {
  amount: SupportAmount;
  locale: Locale;
  origin: string;
}) {
  const prefix = locale === "en" ? "" : `/${locale}`;
  const successUrl = new URL(`${prefix}/support`, origin);
  successUrl.searchParams.set("status", "success");
  successUrl.searchParams.set("session_id", "{CHECKOUT_SESSION_ID}");

  const cancelUrl = new URL(`${prefix}/support`, origin);
  cancelUrl.searchParams.set("status", "cancelled");

  const metadata = {
    purpose: "research_support",
    support_amount_usd: String(amount),
    site_locale: locale,
  };

  return getStripeClient().checkout.sessions.create({
    ui_mode: "hosted_page",
    mode: "payment",
    billing_address_collection: "auto",
    phone_number_collection: { enabled: false },
    // Live tax registrations are active; Managed Payments requires Automatic Tax.
    automatic_tax: { enabled: true },
    allow_promotion_codes: false,
    submit_type: "auto",
    integration_identifier: CHECKOUT_INTEGRATION_IDENTIFIER,
    origin_context: "web",
    locale: locale === "en" ? "en" : "zh",
    success_url: successUrl.toString(),
    cancel_url: cancelUrl.toString(),
    line_items: [{ price: getPriceId(amount), quantity: 1 }],
    metadata,
    payment_intent_data: { metadata },
  });
}

export function getStripeErrorDetails(error: unknown) {
  if (error instanceof Stripe.errors.StripeError) {
    return {
      name: error.name,
      type: error.type,
      code: error.code,
      param: error.param,
      requestId: error.requestId,
      statusCode: error.statusCode,
    };
  }

  return { name: error instanceof Error ? error.name : "Error" };
}
