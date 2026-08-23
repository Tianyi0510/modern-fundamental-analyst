import { NextResponse } from "next/server";
import { cleanText, createMemoryRateLimiter, isSameOrigin, isValidEmail, readLimitedJson, RequestBodyError } from "@/lib/api-request";
import { getResendClient } from "@/lib/resend";

export const runtime = "nodejs";

const isRateLimited = createMemoryRateLimiter({ windowMs: 10 * 60 * 1000, maxRequests: 5 });

type SubscribeRequest = {
  email?: unknown;
  website?: unknown;
};

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (isRateLimited(request)) return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });

  let body: SubscribeRequest;
  try {
    const payload = await readLimitedJson(request, 5_000);
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new Error("Invalid payload");
    body = payload as SubscribeRequest;
  } catch (error) {
    const status = error instanceof RequestBodyError ? error.status : 400;
    const message = error instanceof RequestBodyError ? error.message : "Invalid request.";
    return NextResponse.json({ error: message }, { status });
  }

  const email = cleanText(body.email, 254).toLowerCase();
  const website = cleanText(body.website, 200);
  if (website) return NextResponse.json({ ok: true });
  if (!isValidEmail(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });

  const resend = getResendClient();
  if (!resend) {
    console.error("Subscribe is missing RESEND_API_KEY.");
    return NextResponse.json({ error: "Subscription service is temporarily unavailable." }, { status: 503 });
  }

  const existing = await resend.contacts.get({ email });
  const result = existing.data
    ? await resend.contacts.update({ id: existing.data.id, unsubscribed: false })
    : existing.error?.statusCode === 404
      ? await resend.contacts.create({ email, unsubscribed: false })
      : existing;

  if (result.error) {
    console.error("Resend subscription failed", result.error.name);
    return NextResponse.json({ error: "Subscription could not be completed." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
