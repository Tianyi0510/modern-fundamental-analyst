"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import type { Locale } from "@/lib/i18n";
import styles from "./contact-form.module.css";

export type ContactFormCopy = {
  label: string; title: string; intro: string; name: string; email: string;
  subject: string; message: string; send: string; sending: string; success: string; error: string;
};

export function ContactFormClient({ copy, locale }: { copy: ContactFormCopy; locale: Locale }) {
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
        name: formData.get("name"), email: formData.get("email"), subject: formData.get("subject"),
        message: formData.get("message"), website: formData.get("website"), locale,
      }),
    }).catch(() => null);

    if (response?.ok) {
      form.reset();
      setStatus("success");
      return;
    }
    setStatus("error");
  }

  return <section className={`${styles.section} shell`} aria-labelledby="contact-form-title">
    <div className={styles.heading}>
      <p className={styles.headingLabel}>{copy.label}</p>
      <h2 id="contact-form-title">{copy.title}</h2>
      <p className={styles.headingIntro}>{copy.intro}</p>
    </div>
    <form className={styles.form} onSubmit={submit}>
      <label className={styles.field}><span className={styles.fieldLabel}>{copy.name}</span><input className={styles.control} name="name" type="text" autoComplete="name" maxLength={100} required /></label>
      <label className={styles.field}><span className={styles.fieldLabel}>{copy.email}</span><input className={styles.control} name="email" type="email" autoComplete="email" maxLength={254} required /></label>
      <label className={`${styles.field} ${styles.fieldWide}`}><span className={styles.fieldLabel}>{copy.subject}</span><input className={styles.control} name="subject" type="text" maxLength={160} required /></label>
      <label className={`${styles.field} ${styles.fieldWide}`}><span className={styles.fieldLabel}>{copy.message}</span><textarea className={styles.control} name="message" rows={7} minLength={10} maxLength={5000} required /></label>
      <label className={styles.honeypot} aria-hidden="true"><span>Website</span><input name="website" type="text" tabIndex={-1} autoComplete="off" /></label>
      <div className={styles.actions}>
        <button className={`${styles.submit} button button-dark`} type="submit" disabled={status === "sending"}>{status === "sending" ? copy.sending : copy.send}</button>
        <p className={styles.status} role="status" aria-live="polite">{status === "success" ? copy.success : status === "error" ? copy.error : ""}</p>
      </div>
    </form>
  </section>;
}
