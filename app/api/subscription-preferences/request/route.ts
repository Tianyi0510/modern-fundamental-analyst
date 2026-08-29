import { NextResponse } from "next/server";
import { cleanText, isValidEmail, readProtectedObjectJson } from "@/lib/api-request";
import { renderPreferenceEmail, type PreferenceEmailCopy } from "@/lib/email-template";
import { resolveLocale, type Locale } from "@/lib/i18n";
import { createRateLimiter } from "@/lib/rate-limit";
import { getResendClient, getResendIdempotencyKey, runResendOperation, UPDATES_FROM_EMAIL } from "@/lib/resend";
import { createPreferenceUrl } from "@/lib/subscription-preferences";

export const runtime = "nodejs";
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const isRateLimited = createRateLimiter({ namespace: "subscription-preferences-request", windowMs: RATE_LIMIT_WINDOW_MS, maxRequests: 5 });

const mailCopy = {
  en: { subject: "Manage your email preferences", heading: "Manage Your Email Preferences", body: "Use the secure link below to update your preferred language or unsubscribe.", action: "Manage Email Preferences", note: "If you did not request this email, you can ignore it." },
  "zh-tw": { subject: "管理你的郵件偏好", heading: "管理你的郵件偏好", body: "使用以下安全連結更新偏好語言或取消訂閱。", action: "管理郵件偏好", note: "如果你沒有提出此要求，可以忽略這封郵件。" },
  "zh-cn": { subject: "管理你的邮件偏好", heading: "管理你的邮件偏好", body: "使用以下安全链接更新偏好语言或取消订阅。", action: "管理邮件偏好", note: "如果你没有提出此请求，可以忽略这封邮件。" },
} satisfies Record<Locale, PreferenceEmailCopy & { subject: string }>;

export async function POST(request: Request) {
  const parsed = await readProtectedObjectJson<{ email?: unknown; locale?: unknown }>(request, {
    isRateLimited,
    maxBytes: 5_000,
    rateLimitWindowMs: RATE_LIMIT_WINDOW_MS,
  });
  if (!parsed.ok) return parsed.response;
  const { body } = parsed;

  const email = cleanText(body.email, 254).toLowerCase();
  const locale = resolveLocale(cleanText(body.locale, 10));
  if (!isValidEmail(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });

  const resend = getResendClient();
  if (!resend) return NextResponse.json({ error: "Email service is temporarily unavailable." }, { status: 503 });

  const existing = await runResendOperation("Preference link contact lookup failed", () => resend.contacts.get({ email }));
  if (existing?.data) {
    const text = mailCopy[locale];
    const preferencesUrl = createPreferenceUrl(email, locale, 30 * 60 * 1000);
    const idempotencyKey = getResendIdempotencyKey(request, "preferences");
    const result = await runResendOperation("Preference link email request failed", () => resend.emails.send({
      from: UPDATES_FROM_EMAIL,
      to: email,
      subject: text.subject,
      text: `${text.heading}\n\n${text.body}\n\n${preferencesUrl}\n\n${text.note}`,
      html: renderPreferenceEmail(text, preferencesUrl),
    }, idempotencyKey ? { idempotencyKey } : undefined));
    if (result?.error) console.error("Preference link email failed", result.error.name);
  } else if (existing && existing.error?.statusCode !== 404) {
    console.error("Preference link contact lookup failed", existing.error?.name ?? "UnknownError");
  }

  return NextResponse.json({ ok: true });
}
