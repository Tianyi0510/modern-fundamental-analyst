"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import type { Locale } from "@/lib/i18n";
import styles from "./subscribe-form.module.css";

export type SubscribeFormCopy = {
  title: string; email: string; placeholder: string; submit: string;
  submitting: string; success: string; error: string;
};

type Status = "idle" | "submitting" | "success" | "error";

export function SubscribeFormClient({ copy, locale }: { copy: SubscribeFormCopy; locale: Locale }) {
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
      <h2 id="subscribe-title">{copy.title}</h2>
      <form className={styles.form} onSubmit={submit}>
        <label className={styles.field}>
          <span>{copy.email}</span>
          <input className={styles.control} name="email" type="email" autoComplete="email" inputMode="email" placeholder={copy.placeholder} maxLength={254} required />
        </label>
        <label className={styles.honeypot} aria-hidden="true"><span>Website</span><input name="website" type="text" tabIndex={-1} autoComplete="off" /></label>
        <button className={styles.submit} type="submit" disabled={status === "submitting"}>{status === "submitting" ? copy.submitting : copy.submit}</button>
        <p className={styles.status} role="status" aria-live="polite">{status === "success" ? copy.success : status === "error" ? copy.error : ""}</p>
      </form>
    </section>
  );
}
