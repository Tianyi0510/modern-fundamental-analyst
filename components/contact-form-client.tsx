"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { postJson } from "@/lib/client-post-json";
import type { Locale } from "@/lib/i18n";
import styles from "./contact-form.module.css";
import { useExclusiveSubmit } from "./use-exclusive-submit";
import { useSubmissionId } from "./use-submission-id";

export type ContactFormCopy = {
  label: string; title: string; intro: string; name: string; email: string;
  subject: string; message: string; send: string; sending: string; success: string; error: string;
};

export function ContactFormClient({ copy, locale }: { copy: ContactFormCopy; locale: Locale }) {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const runExclusive = useExclusiveSubmit();
  const { getSubmissionId, resetSubmissionId } = useSubmissionId();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    await runExclusive(async () => {
      setStatus("sending");
      try {
        await postJson("/api/contact", {
          name: formData.get("name"), email: formData.get("email"), subject: formData.get("subject"),
          message: formData.get("message"), website: formData.get("website"), locale,
        }, { idempotencyKey: getSubmissionId() });
        form.reset();
        resetSubmissionId();
        setStatus("success");
      } catch {
        setStatus("error");
      }
    });
  }

  return <section className={`${styles.section} shell`} aria-labelledby="contact-form-title">
    <div className={styles.heading}>
      <p className={styles.headingLabel}>{copy.label}</p>
      <h2 id="contact-form-title">{copy.title}</h2>
      <p className={styles.headingIntro}>{copy.intro}</p>
    </div>
    <form className={styles.form} onSubmit={submit} onChange={() => resetSubmissionId()} aria-busy={status === "sending"}>
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
