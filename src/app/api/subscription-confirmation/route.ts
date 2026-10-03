import { NextResponse } from "next/server";
import { getLatestMemo } from "@/features/memos/memos";
import { confirmSubscription } from "@/features/subscriptions/server/subscription-confirmation";
import { ResendCoordinationError } from "@/features/subscriptions/server/resend-coordination";
import { readProtectedObjectJson } from "@/lib/api-request";
import { createRateLimiter } from "@/lib/rate-limit";

export const runtime = "nodejs";
const windowMs = 10 * 60 * 1000;
const isRateLimited = createRateLimiter({ namespace: "subscription-confirmation", windowMs, maxRequests: 10 });

export async function POST(request: Request) {
  const parsed = await readProtectedObjectJson(request, { isRateLimited, maxBytes: 1000, rateLimitWindowMs: windowMs });
  if (!parsed.ok) return parsed.response;
  const token = parsed.body.token;
  if (typeof token !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(token))
    return NextResponse.json({ error: "Invalid confirmation link." }, { status: 400 });
  try {
    await confirmSubscription(token, getLatestMemo);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Unable to confirm subscription." },
      {
        status: error instanceof ResendCoordinationError ? error.status : 503,
      },
    );
  }
}
