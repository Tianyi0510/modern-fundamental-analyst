import { localeConfig, type Locale } from "@/lib/i18n";
import { SubscribeFormClient, type SubscribeFormCopy } from "./subscribe-form-client";

const copy = {
  en: { title: "Stay Updated.", email: "Email Address", placeholder: "you@example.com", submit: "Subscribe", submitting: "Subscribing…", success: "You’re subscribed. Check your inbox for a welcome email with a secure preferences link.", error: "Subscription could not be completed. Please try again.", preferences: "Email Preferences" },
  "zh-tw": { title: "掌握最新研究。", email: "電子郵件地址", placeholder: "you@example.com", submit: "訂閱", submitting: "訂閱中…", success: "訂閱成功。請查看歡迎郵件中的安全偏好設定連結。", error: "目前無法完成訂閱，請稍後再試。", preferences: "郵件偏好設定" },
  "zh-cn": { title: "掌握最新研究。", email: "电子邮件地址", placeholder: "you@example.com", submit: "订阅", submitting: "订阅中…", success: "订阅成功。请查看欢迎邮件中的安全偏好设置链接。", error: "目前无法完成订阅，请稍后再试。", preferences: "邮件偏好设置" },
} satisfies Record<Locale, SubscribeFormCopy>;

export function SubscribeForm({ locale }: { locale: Locale }) {
  return <SubscribeFormClient copy={copy[locale]} locale={locale} preferencesHref={`${localeConfig[locale].prefix}/subscription-preferences`} />;
}
