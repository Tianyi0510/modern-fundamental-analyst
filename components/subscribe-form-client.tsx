"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { postJson } from "@/lib/client-post-json";
import type { Locale } from "@/lib/i18n";
import styles from "./subscribe-form.module.css";
import { useExclusiveSubmit } from "./use-exclusive-submit";

export type SubscribeFormCopy = {
  title: string; email: string; placeholder: string; submit: string;
  submitting: string; success: string; error: string;
  preferences: string;
};

type Status = "idle" | "submitting" | "success" | "error";

export function SubscribeFormClient({ copy, locale, preferencesHref }: { copy: SubscribeFormCopy; locale: Locale; preferencesHref: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const runExclusive = useExclusiveSubmit();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());

    await runExclusive(async () => {
      setStatus("submitting");
      try {
        await postJson("/api/subscribe", { ...payload, locale });
        form.reset();
        setStatus("success");
      } catch {
        setStatus("error");
      }
    });
  }

  return (
    <section className={styles.section} id="subscribe" aria-labelledby="subscribe-title">
      <h2 id="subscribe-title">{copy.title}</h2>
      <form className={styles.form} onSubmit={submit} aria-busy={status === "submitting"}>
        <label className={styles.field}>
          <span>{copy.email}</span>
          <input className={styles.control} name="email" type="email" autoComplete="email" inputMode="email" placeholder={copy.placeholder} maxLength={254} required />
        </label>
        <label className={styles.honeypot} aria-hidden="true"><span>Website</span><input name="website" type="text" tabIndex={-1} autoComplete="off" /></label>
        <button className={styles.submit} type="submit" disabled={status === "submitting"}>{status === "submitting" ? copy.submitting : copy.submit}</button>
        <a className={styles.preferences} href={preferencesHref}>{copy.preferences}</a>
        <p className={styles.status} role="status" aria-live="polite">{status === "success" ? copy.success : status === "error" ? copy.error : ""}</p>
      </form>
    </section>
  );
}
