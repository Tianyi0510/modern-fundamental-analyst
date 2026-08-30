import { NextResponse } from "next/server";
import { isSameOrigin, readLimitedText, RequestBodyError } from "@/lib/api-request";
import { resolveLocale } from "@/lib/i18n";
import { createRateLimiter } from "@/lib/rate-limit";
import { SITE_URL } from "@/lib/site-config";
import { createSupportCheckoutSession, getStripeErrorDetails, parseSupportAmount } from "@/lib/stripe-checkout";

export const runtime = "nodejs";

const MAX_FORM_BYTES = 5_000;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const isRateLimited = createRateLimiter({ namespace: "stripe-checkout", windowMs: RATE_LIMIT_WINDOW_MS, maxRequests: 8 });

function supportUrl(request: Request, locale: ReturnType<typeof resolveLocale>, status: "cancelled" | "error") {
  const prefix = locale === "en" ? "" : `/${locale}`;
  const url = new URL(`${prefix}/support`, request.url);
  url.searchParams.set("status", status);
  return url;
}

function checkoutOrigin(request: Request) {
  return process.env.NODE_ENV === "production" ? SITE_URL : new URL(request.url).origin;
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (await isRateLimited(request)) {
    return NextResponse.json(
      { error: "Too many checkout attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(RATE_LIMIT_WINDOW_MS / 1000)) } },
    );
  }

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
  if (formData.get("website")) return NextResponse.redirect(supportUrl(request, locale, "cancelled"), 303);

  const amount = parseSupportAmount(formData.get("amount"));
  if (!amount) return NextResponse.json({ error: "Choose a valid support amount." }, { status: 400 });

  try {
    const session = await createSupportCheckoutSession({ amount, locale, origin: checkoutOrigin(request) });
    if (!session.url) throw new Error("Stripe did not return a Checkout URL.");
    return NextResponse.redirect(session.url, 303);
  } catch (error) {
    console.error("Stripe Checkout session creation failed.", getStripeErrorDetails(error));
    return NextResponse.redirect(supportUrl(request, locale, "error"), 303);
  }
}
