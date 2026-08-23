import { NextResponse } from "next/server";
import { getResendClient } from "@/lib/resend";

export const runtime = "nodejs";

const FROM_EMAIL = "Modern Fundamental Analyst <contact@mail.modernfundamentalanalyst.com>";
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const requests = new Map<string, number[]>();

type ContactRequest = {
  name?: unknown;
  email?: unknown;
  subject?: unknown;
  message?: unknown;
  website?: unknown;
  locale?: unknown;
};

function text(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function singleLine(value: unknown, maxLength: number) {
  return Array.from(text(value, maxLength))
    .filter((character) => {
      const code = character.charCodeAt(0);
      return code > 31 && code !== 127;
    })
    .join("")
    .replace(/\s+/g, " ");
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character] ?? character);
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
  if (requests.size > 1000) {
    for (const [storedKey, timestamps] of requests) {
      if (!timestamps.some((timestamp) => now - timestamp < WINDOW_MS)) requests.delete(storedKey);
    }
  }
  return recent.length > MAX_REQUESTS;
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  if (isRateLimited(request)) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 20_000) {
    return NextResponse.json({ error: "Request is too large." }, { status: 413 });
  }

  let body: ContactRequest;
  try {
    const payload: unknown = await request.json();
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new Error("Invalid payload");
    body = payload as ContactRequest;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = singleLine(body.name, 100);
  const email = singleLine(body.email, 254).toLowerCase();
  const subject = singleLine(body.subject, 160);
  const message = text(body.message, 5000);
  const website = text(body.website, 200);
  const locale = text(body.locale, 10);
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (website) return NextResponse.json({ ok: true });
  if (!name || !subject || message.length < 10 || !emailPattern.test(email)) {
    return NextResponse.json({ error: "Please complete every required field." }, { status: 400 });
  }

  const resend = getResendClient();
  const recipient = process.env.CONTACT_TO_EMAIL;
  if (!resend || !recipient) {
    console.error("Contact email is missing RESEND_API_KEY or CONTACT_TO_EMAIL.");
    return NextResponse.json({ error: "Email service is temporarily unavailable." }, { status: 503 });
  }

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: recipient,
    replyTo: email,
    subject: `[MFA Contact] ${subject}`,
    text: `Name: ${name}\nEmail: ${email}\nLanguage: ${locale || "unknown"}\nSubject: ${subject}\n\n${message}`,
    html: `<h1>New website message</h1><p><strong>Name:</strong> ${safeName}</p><p><strong>Email:</strong> ${safeEmail}</p><p><strong>Language:</strong> ${escapeHtml(locale || "unknown")}</p><p><strong>Subject:</strong> ${safeSubject}</p><hr /><p>${safeMessage}</p>`,
  });

  if (error) {
    console.error("Resend contact delivery failed", error.name);
    return NextResponse.json({ error: "Message could not be sent." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
