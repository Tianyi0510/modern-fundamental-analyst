"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { postJson } from "@/lib/client-post-json";
import { localeConfig, locales, type Locale } from "@/lib/i18n";
import styles from "./subscription-preferences.module.css";
import { useExclusiveSubmit } from "./use-exclusive-submit";

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
  const runExclusive = useExclusiveSubmit();

  async function submit(form: HTMLFormElement, action: "save" | "unsubscribe") {
    await runExclusive(async () => {
      const locale = String(new FormData(form).get("locale") ?? initialLocale);
      setStatus(action === "save" ? "saving" : "unsubscribing");

      try {
        await postJson("/api/subscription-preferences", { action, locale, token });
        setStatus(action === "save" ? "saved" : "unsubscribed");
      } catch {
        setStatus("error");
      }
    });
  }

  const busy = status === "saving" || status === "unsubscribing";
  const message = status === "saved" ? copy.saved : status === "unsubscribed" ? copy.unsubscribed : status === "error" ? copy.error : "";

  return <form className={styles.form} aria-busy={busy} onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); void submit(event.currentTarget, "save"); }}>
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
