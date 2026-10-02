"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { updatePreferences } from "./subscription-api";
import { getFormText } from "@/lib/form-data";
import type { PreferencesAction } from "./subscription-contract";
import { localeConfig, locales, type Locale } from "@/lib/i18n";
import styles from "./subscription-preferences.module.css";
import { useExclusiveSubmit } from "@/components/use-exclusive-submit";

export type PreferencesCopy = {
  email: string;
  language: string;
  chooseLanguage: string;
  save: string;
  saving: string;
  saved: string;
  unsubscribe: string;
  unsubscribing: string;
  unsubscribed: string;
  error: string;
};

type Status = "idle" | "saving" | "saved" | "unsubscribing" | "unsubscribed" | "error";

export function SubscriptionPreferencesForm({
  copy,
  email,
  initialLocale,
  token,
}: {
  copy: PreferencesCopy;
  email: string;
  initialLocale: Locale | null;
  token: string;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const runExclusive = useExclusiveSubmit();

  async function submit(form: HTMLFormElement, action: PreferencesAction) {
    await runExclusive(async () => {
      const selectedLocale = getFormText(new FormData(form), "locale");
      const locale = locales.find((candidate) => candidate === selectedLocale);
      setStatus(action === "save" ? "saving" : "unsubscribing");

      try {
        if (action === "save") {
          if (!locale) throw new Error("Choose a valid language.");
          await updatePreferences({ action, locale, token });
        } else {
          await updatePreferences({ action, locale: locale ?? "", token });
        }
        setStatus(action === "save" ? "saved" : "unsubscribed");
      } catch {
        setStatus("error");
      }
    });
  }

  const busy = status === "saving" || status === "unsubscribing";
  const message =
    status === "saved"
      ? copy.saved
      : status === "unsubscribed"
        ? copy.unsubscribed
        : status === "error"
          ? copy.error
          : "";

  return (
    <form
      className={styles.form}
      aria-busy={busy}
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        void submit(event.currentTarget, "save");
      }}
    >
      <div className={styles.field}>
        <span>{copy.email}</span>
        <strong>{email}</strong>
      </div>
      <label className={styles.field}>
        <span>{copy.language}</span>
        <select
          name="locale"
          required
          defaultValue={initialLocale ?? ""}
          onChange={() => setStatus("idle")}
          disabled={busy || status === "unsubscribed"}
        >
          <option value="" disabled>
            {copy.chooseLanguage}
          </option>
          {locales.map((locale) => (
            <option value={locale} key={locale}>
              {localeConfig[locale].label}
            </option>
          ))}
        </select>
      </label>
      <div className={styles.actions}>
        <button className="button button-dark" type="submit" disabled={busy || status === "unsubscribed"}>
          {status === "saving" ? copy.saving : copy.save}
        </button>
        <button
          className={styles.unsubscribe}
          type="button"
          disabled={busy || status === "unsubscribed"}
          onClick={(event) => {
            if (event.currentTarget.form) void submit(event.currentTarget.form, "unsubscribe");
          }}
        >
          {status === "unsubscribing" ? copy.unsubscribing : copy.unsubscribe}
        </button>
      </div>
      <p className={styles.status} role="status" aria-live="polite">
        {message}
      </p>
    </form>
  );
}
