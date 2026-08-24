import { NextResponse } from "next/server";
import { cleanText, createRateLimiter, isSameOrigin, isValidEmail, readLimitedJson, RequestBodyError } from "@/lib/api-request";
import { locales, type Locale } from "@/lib/i18n";
import { getResendClient } from "@/lib/resend";
import { createPreferenceUrl } from "@/lib/subscription-preferences";

export const runtime = "nodejs";
const isRateLimited = createRateLimiter({ namespace: "subscription-preferences-request", windowMs: 10 * 60 * 1000, maxRequests: 5 });

const mailCopy = {
  en: { subject: "Manage your email preferences", heading: "Manage Your Email Preferences", body: "Use the secure link below to update your preferred language or unsubscribe.", action: "Manage Email Preferences", note: "If you did not request this email, you can ignore it." },
  "zh-tw": { subject: "管理你的郵件偏好", heading: "管理你的郵件偏好", body: "使用以下安全連結更新偏好語言或取消訂閱。", action: "管理郵件偏好", note: "如果你沒有提出此要求，可以忽略這封郵件。" },
  "zh-cn": { subject: "管理你的邮件偏好", heading: "管理你的邮件偏好", body: "使用以下安全链接更新偏好语言或取消订阅。", action: "管理邮件偏好", note: "如果你没有提出此请求，可以忽略这封邮件。" },
} satisfies Record<Locale, { subject: string; heading: string; body: string; action: string; note: string }>;

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (await isRateLimited(request)) return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });

  let body: { email?: unknown; locale?: unknown };
  try {
    const payload = await readLimitedJson(request, 5_000);
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new Error("Invalid payload");
    body = payload;
  } catch (error) {
    const status = error instanceof RequestBodyError ? error.status : 400;
    return NextResponse.json({ error: error instanceof RequestBodyError ? error.message : "Invalid request." }, { status });
  }

  const email = cleanText(body.email, 254).toLowerCase();
  const requestedLocale = cleanText(body.locale, 10);
  const locale: Locale = locales.includes(requestedLocale as Locale) ? requestedLocale as Locale : "en";
  if (!isValidEmail(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });

  const resend = getResendClient();
  if (!resend) return NextResponse.json({ error: "Email service is temporarily unavailable." }, { status: 503 });

  const existing = await resend.contacts.get({ email });
  if (existing.data) {
    const text = mailCopy[locale];
    const preferencesUrl = createPreferenceUrl(email, locale, 30 * 60 * 1000);
    const result = await resend.emails.send({
      from: "Modern Fundamental Analyst <updates@mail.modernfundamentalanalyst.com>",
      to: email,
      subject: text.subject,
      text: `${text.heading}\n\n${text.body}\n\n${preferencesUrl}\n\n${text.note}`,
      html: `<div style="background:#ededed;padding:32px 16px"><div style="background:#fff;color:#000;max-width:600px;margin:0 auto;font-family:Arial,Helvetica,sans-serif"><div style="background:#002991;padding:28px 32px"><p style="color:#5fcdfd;font-size:14px;font-weight:700;margin:0 0 8px">MODERN FUNDAMENTAL ANALYST</p><h1 style="color:#fff;font-size:28px;line-height:36px;margin:0">${text.heading}</h1></div><div style="padding:32px"><p style="font-size:17px;line-height:28px;margin:0 0 24px">${text.body}</p><a href="${preferencesUrl}" style="background:#5fcdfd;color:#000;display:inline-block;font-size:15px;font-weight:700;padding:14px 22px;text-decoration:none">${text.action} →</a><p style="font-size:13px;line-height:20px;margin:28px 0 0">${text.note}</p></div></div></div>`,
    });
    if (result.error) console.error("Preference link email failed", result.error.name);
  } else if (existing.error?.statusCode !== 404) {
    console.error("Preference link contact lookup failed", existing.error?.name ?? "UnknownError");
  }

  return NextResponse.json({ ok: true });
}
