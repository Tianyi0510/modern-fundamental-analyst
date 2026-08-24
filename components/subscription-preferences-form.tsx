"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { localeConfig, locales, type Locale } from "@/lib/i18n";
import styles from "./subscription-preferences.module.css";

export type PreferencesCopy = {
  email: string;
  language: string;
  save: string;
  saving: string;
  saved: string;
  unsubscribe: string;
  unsubscribing: string;
  unsubscribed: string;
  error: string;
};

type Status = "idle" | "saving" | "saved" | "unsubscribing" | "unsubscribed" | "error";

export function SubscriptionPreferencesForm({ copy, email, initialLocale, token }: { copy: PreferencesCopy; email: string; initialLocale: Locale; token: string }) {
  const [status, setStatus] = useState<Status>("idle");

  async function submit(form: HTMLFormElement, action: "save" | "unsubscribe") {
    const locale = String(new FormData(form).get("locale") ?? initialLocale);
    setStatus(action === "save" ? "saving" : "unsubscribing");

    try {
      const response = await fetch("/api/subscription-preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, locale, token }),
      });
      if (!response.ok) throw new Error("Preferences update failed");
      setStatus(action === "save" ? "saved" : "unsubscribed");
    } catch {
      setStatus("error");
    }
  }

  const busy = status === "saving" || status === "unsubscribing";
  const message = status === "saved" ? copy.saved : status === "unsubscribed" ? copy.unsubscribed : status === "error" ? copy.error : "";

  return <form className={styles.form} onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); void submit(event.currentTarget, "save"); }}>
    <div className={styles.field}>
      <span>{copy.email}</span>
      <strong>{email}</strong>
    </div>
    <label className={styles.field}>
      <span>{copy.language}</span>
      <select name="locale" defaultValue={initialLocale} disabled={busy || status === "unsubscribed"}>
        {locales.map((locale) => <option value={locale} key={locale}>{localeConfig[locale].label}</option>)}
      </select>
    </label>
    <div className={styles.actions}>
      <button className="button button-dark" type="submit" disabled={busy || status === "unsubscribed"}>{status === "saving" ? copy.saving : copy.save}</button>
      <button className={styles.unsubscribe} type="button" disabled={busy || status === "unsubscribed"} onClick={(event) => { if (event.currentTarget.form) void submit(event.currentTarget.form, "unsubscribe"); }}>{status === "unsubscribing" ? copy.unsubscribing : copy.unsubscribe}</button>
    </div>
    <p className={styles.status} role="status" aria-live="polite">{message}</p>
  </form>;
}
