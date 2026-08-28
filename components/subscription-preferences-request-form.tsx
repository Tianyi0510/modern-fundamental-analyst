"use client";

import { useState, type FormEvent } from "react";
import type { Locale } from "@/lib/i18n";
import styles from "./subscription-preferences.module.css";
import { useSubmissionId } from "./use-submission-id";

export type PreferencesRequestCopy = { email: string; request: string; requesting: string; sent: string; error: string };

export function SubscriptionPreferencesRequestForm({ copy, locale }: { copy: PreferencesRequestCopy; locale: Locale }) {
  const [status, setStatus] = useState<"idle" | "requesting" | "sent" | "error">("idle");
  const { getSubmissionId, resetSubmissionId } = useSubmissionId();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("requesting");
    const form = event.currentTarget;
    const email = String(new FormData(form).get("email") ?? "");
    try {
      const response = await fetch("/api/subscription-preferences/request", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": getSubmissionId() },
        body: JSON.stringify({ email, locale }),
      });
      if (!response.ok) throw new Error("Preference link request failed");
      form.reset();
      resetSubmissionId();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  const message = status === "sent" ? copy.sent : status === "error" ? copy.error : "";
  return <form className={styles.form} onSubmit={submit} onChange={() => resetSubmissionId()}>
    <label className={styles.field}>
      <span>{copy.email}</span>
      <input name="email" type="email" autoComplete="email" inputMode="email" maxLength={254} required />
    </label>
    <div className={styles.actions}>
      <button className="button button-dark" type="submit" disabled={status === "requesting"}>{status === "requesting" ? copy.requesting : copy.request}</button>
    </div>
    <p className={styles.status} role="status" aria-live="polite">{message}</p>
  </form>;
}
