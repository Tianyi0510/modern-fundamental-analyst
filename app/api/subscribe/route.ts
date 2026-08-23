import { NextResponse } from "next/server";
import { getResendClient } from "@/lib/resend";

export const runtime = "nodejs";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const requests = new Map<string, number[]>();

type SubscribeRequest = {
  email?: unknown;
  website?: unknown;
};

function text(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function isRateLimited(request: Request) {
  const now = Date.now();
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const key = forwarded || "unknown";
  const recent = (requests.get(key) ?? []).filter((timestamp) => now - timestamp < WINDOW_MS);
  recent.push(now);
  requests.set(key, recent);
  return recent.length > MAX_REQUESTS;
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (isRateLimited(request)) return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  if (Number(request.headers.get("content-length") ?? 0) > 5_000) return NextResponse.json({ error: "Request is too large." }, { status: 413 });

  let body: SubscribeRequest;
  try {
    const payload: unknown = await request.json();
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new Error("Invalid payload");
    body = payload as SubscribeRequest;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = text(body.email, 254).toLowerCase();
  const website = text(body.website, 200);
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (website) return NextResponse.json({ ok: true });
  if (!emailPattern.test(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });

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
