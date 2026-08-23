"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import type { Locale } from "@/lib/i18n";
import styles from "./subscribe-form.module.css";

const copy = {
  en: {
    label: "Subscribe",
    title: "Stay Updated.",
    email: "Email Address",
    placeholder: "you@example.com",
    submit: "Subscribe",
    submitting: "Subscribing…",
    success: "You’re subscribed. Thank you for following the research.",
    error: "Subscription could not be completed. Please try again.",
  },
  "zh-tw": {
    label: "訂閱",
    title: "掌握最新研究。",
    email: "電子郵件地址",
    placeholder: "you@example.com",
    submit: "訂閱",
    submitting: "訂閱中…",
    success: "訂閱成功。感謝你持續關注研究內容。",
    error: "目前無法完成訂閱，請稍後再試。",
  },
  "zh-cn": {
    label: "订阅",
    title: "掌握最新研究。",
    email: "电子邮件地址",
    placeholder: "you@example.com",
    submit: "订阅",
    submitting: "订阅中…",
    success: "订阅成功。感谢你持续关注研究内容。",
    error: "目前无法完成订阅，请稍后再试。",
  },
} as const;

type Status = "idle" | "submitting" | "success" | "error";

export function SubscribeForm({ locale }: { locale: Locale }) {
  const text = copy[locale];
  const [status, setStatus] = useState<Status>("idle");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, locale }),
      });
      if (!response.ok) throw new Error("Subscription failed");
      form.reset();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className={styles.section} id="subscribe" aria-labelledby="subscribe-title">
      <p className={styles.label}>{text.label}</p>
      <h2 id="subscribe-title">{text.title}</h2>
      <form className={styles.form} onSubmit={submit}>
        <label className={styles.field}>
          <span>{text.email}</span>
          <input className={styles.control} name="email" type="email" autoComplete="email" inputMode="email" placeholder={text.placeholder} maxLength={254} required />
        </label>
        <label className={styles.honeypot} aria-hidden="true"><span>Website</span><input name="website" type="text" tabIndex={-1} autoComplete="off" /></label>
        <button className={styles.submit} type="submit" disabled={status === "submitting"}>{status === "submitting" ? text.submitting : text.submit}</button>
        <p className={styles.status} role="status" aria-live="polite">{status === "success" ? text.success : status === "error" ? text.error : ""}</p>
      </form>
    </section>
  );
}
