import type { Locale } from "@/lib/i18n";
import { ContactFormClient, type ContactFormCopy } from "./contact-form-client";

const copy = {
  en: {
    title: "Send a Message",
    intro: "Send your question or proposal to receive a reply by email.",
    name: "Name",
    email: "Email",
    subject: "Subject",
    message: "Message",
    send: "Send Message",
    sending: "Sending…",
    success: "Your message has been sent. Thank you for reaching out.",
    error: "Your message couldn't be sent. Please try again later.",
    validation: {
      name: "Enter your name.",
      email: "Enter a valid email address.",
      subject: "Enter a subject.",
      message: "Enter a message with at least 10 characters.",
      summary: "Check the required fields, then send your message again.",
    },
  },
  "zh-tw": {
    title: "傳送訊息",
    intro: "傳送你的問題或合作提案，透過電子郵件取得回覆。",
    name: "姓名",
    email: "電子郵件",
    subject: "主旨",
    message: "訊息",
    send: "傳送訊息",
    sending: "傳送中…",
    success: "訊息已成功傳送，感謝你的聯絡。",
    error: "目前無法傳送訊息，請稍後再試。",
    validation: {
      name: "請輸入姓名。",
      email: "請輸入有效的電子郵件地址。",
      subject: "請輸入主旨。",
      message: "請輸入至少 10 個字元的訊息。",
      summary: "請檢查必填欄位後，再次傳送訊息。",
    },
  },
  "zh-cn": {
    title: "发送信息",
    intro: "发送你的问题或合作提案，通过电子邮件获取回复。",
    name: "姓名",
    email: "电子邮件",
    subject: "主题",
    message: "信息",
    send: "发送信息",
    sending: "发送中…",
    success: "信息已成功发送，感谢你的联系。",
    error: "目前无法发送信息，请稍后再试。",
    validation: {
      name: "请输入姓名。",
      email: "请输入有效的电子邮件地址。",
      subject: "请输入主题。",
      message: "请输入至少 10 个字符的信息。",
      summary: "请检查必填项后，再次发送信息。",
    },
  },
} satisfies Record<Locale, ContactFormCopy>;

export function ContactForm({ locale }: { locale: Locale }) {
  return <ContactFormClient copy={copy[locale]} locale={locale} />;
}
