import "server-only";
import Stripe from "stripe";
import { getLocalizedPath, type Locale } from "@/lib/i18n";
import {
  parseSupportAmount,
  type SupportStatus,
  type SupportProductId,
  parseSupportProductId,
} from "@/features/support/support-config";
import { getSupportProduct } from "./support-catalog";

const CHECKOUT_INTEGRATION_IDENTIFIER = "hosted_web_0001_mfaqxkpt";
const STRIPE_API_VERSION = "2026-08-26.dahlia" as const;

let stripeClient: Stripe | undefined;

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

type CheckoutRequest = { locale: Locale; origin: string; productId: SupportProductId; attemptId: string };

export async function createSupportCheckoutSession({ locale, origin, attemptId, productId }: CheckoutRequest) {
  const product = getSupportProduct(productId);
  const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = {
    quantity: 1,
    price_data: {
      currency: product.currency,
      unit_amount: product.unitAmount,
      product_data: { name: product.name, tax_code: product.taxCode },
    },
  };
  const successUrl = new URL(getLocalizedPath("/support", locale), origin);
  successUrl.searchParams.set("status", "success");
  successUrl.searchParams.set("session_id", "{CHECKOUT_SESSION_ID}");

  const cancelUrl = new URL(getLocalizedPath("/support", locale), origin);
  cancelUrl.searchParams.set("status", "cancelled");

  const metadata = {
    purpose: "research_support",
    support_amount_usd: String(product.unitAmount / 100),
    support_product_id: product.id,
    site_locale: locale,
  };

  return getStripeClient().checkout.sessions.create(
    {
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
      line_items: [lineItem],
      metadata,
      payment_intent_data: { metadata },
    },
    { idempotencyKey: `support-checkout:v2:${attemptId}` },
  );
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

export async function resolveSupportStatus(params: { status?: string; session_id?: string }): Promise<SupportStatus> {
  if (
    params.status === "cancelled" ||
    params.status === "error" ||
    params.status === "rate-limited" ||
    params.status === "invalid-amount" ||
    params.status === "retired-checkout"
  )
    return params.status;
  if (params.status !== "success") return undefined;
  if (!params.session_id || !/^cs_(test|live)_[A-Za-z0-9]{1,240}$/.test(params.session_id)) return "unverified";
  try {
    const session = await getStripeClient().checkout.sessions.retrieve(
      params.session_id,
      {},
      { timeout: 5_000, maxNetworkRetries: 0 },
    );
    if (session.mode !== "payment" || session.metadata?.purpose !== "research_support" || session.currency !== "usd")
      return "unverified";
    if (session.metadata.support_product_id !== undefined) {
      const id = parseSupportProductId(session.metadata.support_product_id);
      if (!id) return "unverified";
      const product = getSupportProduct(id);
      if (
        session.amount_subtotal !== product.unitAmount ||
        session.metadata.support_amount_usd !== String(product.unitAmount / 100)
      )
        return "unverified";
    } else if (!parseSupportAmount(session.metadata.support_amount_usd ?? null)) {
      return "unverified";
    }
    if (session.status === "complete" && session.payment_status === "paid") return "success";
    return session.status === "complete" ? "pending" : "unverified";
  } catch (error) {
    console.error("Stripe payment status verification failed.", getStripeErrorDetails(error));
    return "unverified";
  }
}
