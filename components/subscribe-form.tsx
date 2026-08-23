import type { Locale } from "@/lib/i18n";
import { SubscribeFormClient, type SubscribeFormCopy } from "./subscribe-form-client";

const copy = {
  en: { title: "Stay Updated.", email: "Email Address", placeholder: "you@example.com", submit: "Subscribe", submitting: "Subscribing…", success: "You’re subscribed. Thank you for following the research.", error: "Subscription could not be completed. Please try again." },
  "zh-tw": { title: "掌握最新研究。", email: "電子郵件地址", placeholder: "you@example.com", submit: "訂閱", submitting: "訂閱中…", success: "訂閱成功。感謝你持續關注研究內容。", error: "目前無法完成訂閱，請稍後再試。" },
  "zh-cn": { title: "掌握最新研究。", email: "电子邮件地址", placeholder: "you@example.com", submit: "订阅", submitting: "订阅中…", success: "订阅成功。感谢你持续关注研究内容。", error: "目前无法完成订阅，请稍后再试。" },
} satisfies Record<Locale, SubscribeFormCopy>;

export function SubscribeForm({ locale }: { locale: Locale }) {
  return <SubscribeFormClient copy={copy[locale]} locale={locale} />;
}
