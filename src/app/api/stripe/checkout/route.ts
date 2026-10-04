import { NextResponse } from "next/server";
import { reportServiceFailure } from "@/lib/sentry-server";
import { isSameOrigin, readLimitedText, RequestBodyError } from "@/lib/api-request";
import { getLocalizedPath, resolveLocale } from "@/lib/i18n";
import { createRateLimiter } from "@/lib/rate-limit";
import { SITE_URL } from "@/lib/site-config";
import { parseCheckoutAttempt, parseSupportProductId, type SupportProductId } from "@/features/support/support-config";
import { createSupportCheckoutSession, getStripeErrorDetails } from "@/features/support/server/stripe-checkout";

export const runtime = "nodejs";

const MAX_FORM_BYTES = 5_000;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const isRateLimited = createRateLimiter({
  namespace: "stripe-checkout",
  windowMs: RATE_LIMIT_WINDOW_MS,
  maxRequests: 8,
});

function supportUrl(
  request: Request,
  locale: ReturnType<typeof resolveLocale>,
  status: "cancelled" | "error" | "rate-limited" | "invalid-amount" | "retired-checkout",
  recovery?: {
    attemptId?: string;
    productId: SupportProductId | null;
    checkoutLocale: ReturnType<typeof resolveLocale>;
  },
) {
  // Next.js may normalize the internal request host; use the origin already checked by isSameOrigin.
  const url = new URL(getLocalizedPath("/support", locale), request.headers.get("origin")!);
  url.searchParams.set("status", status);
  if (recovery?.attemptId && recovery.productId) {
    url.searchParams.set("checkout_attempt", recovery.attemptId);
    url.searchParams.set("product_id", recovery.productId);
    url.searchParams.set("checkout_locale", recovery.checkoutLocale);
  }
  return url;
}

function checkoutOrigin(request: Request) {
  return process.env.NODE_ENV === "production" ? SITE_URL : request.headers.get("origin")!;
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_FORM_BYTES) {
    return NextResponse.json({ error: "Request is too large." }, { status: 413 });
  }

  const contentType = request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase();
  if (contentType !== "application/x-www-form-urlencoded") {
    return NextResponse.json({ error: "Unsupported request format." }, { status: 415 });
  }

  let formData: URLSearchParams;
  try {
    formData = new URLSearchParams(await readLimitedText(request, MAX_FORM_BYTES));
  } catch (error) {
    const status = error instanceof RequestBodyError ? error.status : 400;
    return NextResponse.json({ error: status === 413 ? "Request is too large." : "Invalid request." }, { status });
  }

  const locale = resolveLocale(formData.get("locale"));
  const checkoutLocale = resolveLocale(formData.get("checkout_locale"), locale);
  const hasProduct = formData.has("product_id");
  const productId =
    formData.getAll("product_id").length === 1 ? parseSupportProductId(formData.get("product_id")) : null;
  const attemptId =
    formData.getAll("checkout_attempt").length === 1
      ? parseCheckoutAttempt(formData.get("checkout_attempt"))
      : undefined;
  if (await isRateLimited(request)) {
    const response = NextResponse.redirect(
      supportUrl(request, locale, "rate-limited", {
        attemptId,
        productId,
        checkoutLocale,
      }),
      303,
    );
    response.headers.set("Retry-After", String(Math.ceil(RATE_LIMIT_WINDOW_MS / 1000)));
    return response;
  }
  if (formData.get("website")) return NextResponse.redirect(supportUrl(request, locale, "cancelled"), 303);

  if (!hasProduct && formData.has("amount"))
    return NextResponse.redirect(supportUrl(request, locale, "retired-checkout"), 303);
  if (!productId) return NextResponse.redirect(supportUrl(request, locale, "invalid-amount"), 303);
  if (!attemptId) {
    return NextResponse.redirect(
      supportUrl(request, locale, "error", {
        attemptId,
        productId,
        checkoutLocale,
      }),
      303,
    );
  }

  try {
    const session = await createSupportCheckoutSession({
      productId,
      attemptId,
      locale: checkoutLocale,
      origin: checkoutOrigin(request),
    });
    if (!session.url) throw new Error("Stripe did not return a Checkout URL.");
    return NextResponse.redirect(session.url, 303);
  } catch (error) {
    reportServiceFailure("stripe.checkout.create", "exception");
    console.error("Stripe Checkout session creation failed.", getStripeErrorDetails(error));
    return NextResponse.redirect(
      supportUrl(request, locale, "error", {
        attemptId,
        productId,
        checkoutLocale,
      }),
      303,
    );
  }
}
