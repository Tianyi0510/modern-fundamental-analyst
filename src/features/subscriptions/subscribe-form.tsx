import { getLocalizedPath, type Locale } from "@/lib/i18n";
import { SubscribeFormClient, type SubscribeFormCopy } from "./subscribe-form-client";

const copy = {
  en: {
    title: "Stay Updated.",
    email: "Email Address",
    placeholder: "you@example.com",
    submit: "Subscribe",
    submitting: "Subscribing…",
    success: "Check your inbox and confirm your subscription.",
    alreadySubscribed: "You are already subscribed to Modern Fundamental Analyst.",
    error: "Your subscription couldn’t be completed. Please try again.",
    preferences: "Email Preferences",
  },
  "zh-tw": {
    title: "掌握最新研究。",
    email: "電子郵件地址",
    placeholder: "you@example.com",
    submit: "訂閱",
    submitting: "訂閱中…",
    success: "請查看電子郵件並確認你的訂閱。",
    alreadySubscribed: "你已訂閱 Modern Fundamental Analyst。",
    error: "無法完成你的訂閱，請再試一次。",
    preferences: "郵件偏好設定",
  },
  "zh-cn": {
    title: "掌握最新研究。",
    email: "电子邮件地址",
    placeholder: "you@example.com",
    submit: "订阅",
    submitting: "订阅中…",
    success: "请查看电子邮件并确认你的订阅。",
    alreadySubscribed: "你已订阅 Modern Fundamental Analyst。",
    error: "无法完成你的订阅，请重试。",
    preferences: "邮件偏好设置",
  },
} satisfies Record<Locale, SubscribeFormCopy>;

export function SubscribeForm({
  locale,
  variant = "inverse",
  id = "subscribe",
  title,
  intro,
}: {
  locale: Locale;
  variant?: "standard" | "inverse";
  id?: string;
  title?: string;
  intro?: string;
}) {
  return (
    <SubscribeFormClient
      copy={title ? { ...copy[locale], title } : copy[locale]}
      variant={variant}
      id={id}
      intro={intro}
      locale={locale}
      preferencesHref={getLocalizedPath("/subscription-preferences", locale)}
    />
  );
}
