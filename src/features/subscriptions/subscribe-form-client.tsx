"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { PostJsonError } from "@/lib/client-post-json";
import { subscribeToUpdates } from "./subscription-api";
import { getFormText } from "@/lib/form-data";
import type { Locale } from "@/lib/i18n";
import styles from "./subscribe-form.module.css";
import { HoneypotField } from "@/components/honeypot-field";
import { useExclusiveSubmit } from "@/components/use-exclusive-submit";

export type SubscribeFormCopy = {
  title: string;
  email: string;
  placeholder: string;
  submit: string;
  submitting: string;
  success: string;
  alreadySubscribed: string;
  error: string;
  preferences: string;
};

type Status = "idle" | "submitting" | "success" | "alreadySubscribed" | "error";

export function SubscribeFormClient({
  copy,
  locale,
  preferencesHref,
}: {
  copy: SubscribeFormCopy;
  locale: Locale;
  preferencesHref: string;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const runExclusive = useExclusiveSubmit();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    await runExclusive(async () => {
      setStatus("submitting");
      try {
        await subscribeToUpdates({
          email: getFormText(formData, "email"),
          website: getFormText(formData, "website"),
          locale,
        });
        form.reset();
        setStatus("success");
      } catch (error) {
        setStatus(error instanceof PostJsonError && error.status === 409 ? "alreadySubscribed" : "error");
      }
    });
  }

  return (
    <section className={styles.section} id="subscribe" aria-labelledby="subscribe-title">
      <h2 id="subscribe-title">{copy.title}</h2>
      <form
        className={styles.form}
        onSubmit={(event) => {
          void submit(event);
        }}
        onChange={() => setStatus("idle")}
        aria-busy={status === "submitting"}
      >
        <label className={styles.field}>
          <span>{copy.email}</span>
          <input
            disabled={status === "submitting"}
            className={styles.control}
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder={copy.placeholder}
            maxLength={254}
            required
          />
        </label>
        <HoneypotField />
        <button className={styles.submit} type="submit" disabled={status === "submitting"}>
          {status === "submitting" ? copy.submitting : copy.submit}
        </button>
        <a className={styles.preferences} href={preferencesHref}>
          {copy.preferences}
        </a>
        <p className={styles.status} role="status" aria-live="polite">
          {status === "success"
            ? copy.success
            : status === "alreadySubscribed"
              ? copy.alreadySubscribed
              : status === "error"
                ? copy.error
                : ""}
        </p>
      </form>
    </section>
  );
}
