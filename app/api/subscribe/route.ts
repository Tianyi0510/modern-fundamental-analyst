import { NextResponse } from "next/server";
import { cleanText, getRequestErrorDetails, isSameOrigin, isValidEmail, readObjectJson } from "@/lib/api-request";
import { resolveLocale } from "@/lib/i18n";
import { createRateLimiter } from "@/lib/rate-limit";
import { subscribeContact } from "@/lib/subscription-service";

export const runtime = "nodejs";

const isRateLimited = createRateLimiter({ namespace: "subscribe", windowMs: 10 * 60 * 1000, maxRequests: 5 });

type SubscribeRequest = {
  email?: unknown;
  locale?: unknown;
  website?: unknown;
};

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (await isRateLimited(request)) return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });

  let body: SubscribeRequest;
  try {
    body = await readObjectJson<SubscribeRequest>(request, 5_000);
  } catch (error) {
    const { message, status } = getRequestErrorDetails(error);
    return NextResponse.json({ error: message }, { status });
  }

  const email = cleanText(body.email, 254).toLowerCase();
  const locale = resolveLocale(cleanText(body.locale, 10));
  const website = cleanText(body.website, 200);
  if (website) return NextResponse.json({ ok: true });
  if (!isValidEmail(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });

  const result = await subscribeContact(email, locale);
  return result.ok
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ error: result.message }, { status: result.status });
}
