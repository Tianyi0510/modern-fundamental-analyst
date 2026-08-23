"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import type { Locale } from "@/lib/i18n";

const copy = {
  en: {
    label: "Send A Message",
    title: "Start A Conversation",
    intro: "Use the form below and I will respond as soon as possible.",
    name: "Name",
    email: "Email",
    subject: "Subject",
    message: "Message",
    send: "Send Message",
    sending: "Sending…",
    success: "Your message has been sent. Thank you for reaching out.",
    error: "Your message could not be sent. Please try again later.",
  },
  "zh-tw": {
    label: "傳送訊息",
    title: "開始交流",
    intro: "請填寫以下表單，我會盡快回覆。",
    name: "姓名",
    email: "電子郵件",
    subject: "主旨",
    message: "訊息",
    send: "傳送訊息",
    sending: "傳送中…",
    success: "訊息已成功傳送，感謝你的聯絡。",
    error: "目前無法傳送訊息，請稍後再試。",
  },
  "zh-cn": {
    label: "发送信息",
    title: "开始交流",
    intro: "请填写以下表单，我会尽快回复。",
    name: "姓名",
    email: "电子邮件",
    subject: "主题",
    message: "信息",
    send: "发送信息",
    sending: "发送中…",
    success: "信息已成功发送，感谢你的联系。",
    error: "目前无法发送信息，请稍后再试。",
  },
} as const;

export function ContactForm({ locale }: { locale: Locale }) {
  const text = copy[locale];
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    const form = event.currentTarget;
    const formData = new FormData(form);
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        subject: formData.get("subject"),
        message: formData.get("message"),
        website: formData.get("website"),
        locale,
      }),
    }).catch(() => null);

    if (response?.ok) {
      form.reset();
      setStatus("success");
      return;
    }
    setStatus("error");
  }

  return <section className="contact-form-section shell" aria-labelledby="contact-form-title">
    <div className="contact-form-heading">
      <p className="section-number">{text.label}</p>
      <h2 id="contact-form-title">{text.title}</h2>
      <p>{text.intro}</p>
    </div>
    <form className="contact-form" onSubmit={submit}>
      <label><span>{text.name}</span><input name="name" type="text" autoComplete="name" maxLength={100} required /></label>
      <label><span>{text.email}</span><input name="email" type="email" autoComplete="email" maxLength={254} required /></label>
      <label className="contact-form-wide"><span>{text.subject}</span><input name="subject" type="text" maxLength={160} required /></label>
      <label className="contact-form-wide"><span>{text.message}</span><textarea name="message" rows={7} minLength={10} maxLength={5000} required /></label>
      <label className="contact-honeypot" aria-hidden="true"><span>Website</span><input name="website" type="text" tabIndex={-1} autoComplete="off" /></label>
      <div className="contact-form-actions">
        <button className="button button-dark" type="submit" disabled={status === "sending"}>{status === "sending" ? text.sending : text.send}</button>
        <p className="contact-form-status" role="status" aria-live="polite">{status === "success" ? text.success : status === "error" ? text.error : ""}</p>
      </div>
    </form>
  </section>;
}
