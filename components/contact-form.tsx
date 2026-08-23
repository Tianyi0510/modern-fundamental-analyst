import type { Locale } from "@/lib/i18n";
import { ContactFormClient, type ContactFormCopy } from "./contact-form-client";

const copy = {
  en: { label: "Send A Message", title: "Start A Conversation", intro: "Use the form below and I will respond as soon as possible.", name: "Name", email: "Email", subject: "Subject", message: "Message", send: "Send Message", sending: "Sending…", success: "Your message has been sent. Thank you for reaching out.", error: "Your message could not be sent. Please try again later." },
  "zh-tw": { label: "傳送訊息", title: "開始交流", intro: "請填寫以下表單，我會盡快回覆。", name: "姓名", email: "電子郵件", subject: "主旨", message: "訊息", send: "傳送訊息", sending: "傳送中…", success: "訊息已成功傳送，感謝你的聯絡。", error: "目前無法傳送訊息，請稍後再試。" },
  "zh-cn": { label: "发送信息", title: "开始交流", intro: "请填写以下表单，我会尽快回复。", name: "姓名", email: "电子邮件", subject: "主题", message: "信息", send: "发送信息", sending: "发送中…", success: "信息已成功发送，感谢你的联系。", error: "目前无法发送信息，请稍后再试。" },
} satisfies Record<Locale, ContactFormCopy>;

export function ContactForm({ locale }: { locale: Locale }) {
  return <ContactFormClient copy={copy[locale]} locale={locale} />;
}
