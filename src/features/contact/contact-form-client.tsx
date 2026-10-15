"use client";

import { appearance } from "./contact-form-client.styles";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/container";
import { FieldGroup } from "@/components/ui/field";
import { FormField } from "@/components/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert";

import { useEffect, useRef, useState } from "react";
import type { SubmitEvent } from "react";
import { sendContactMessage } from "./contact-api";
import { getFormText } from "@/lib/form-data";
import type { Locale } from "@/lib/i18n";
import { HoneypotField } from "@/components/honeypot-field";
import { useExclusiveSubmit } from "@/components/use-exclusive-submit";
import { useSubmissionId } from "@/components/use-submission-id";
import { clearContactDraft, contactFieldLimits, readContactDraft, saveContactDraft } from "./contact-draft";

export type ContactFormCopy = {
  title: string;
  intro: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  send: string;
  sending: string;
  success: string;
  error: string;
};

export function ContactFormClient({ copy, locale }: { copy: ContactFormCopy; locale: Locale }) {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const runExclusive = useExclusiveSubmit();
  const formRef = useRef<HTMLFormElement>(null);
  const { getSubmissionId, resetSubmissionId } = useSubmissionId(() => {
    const draft = readContactDraft(locale);
    const form = formRef.current;
    if (!draft || !form) return;
    const current = new FormData(form);
    return (Object.keys(contactFieldLimits) as Array<keyof typeof contactFieldLimits>).every(
      (field) => getFormText(current, field) === draft[field],
    )
      ? draft.submissionId
      : undefined;
  });

  useEffect(() => {
    const draft = readContactDraft(locale);
    if (!draft) return;
    for (const field of Object.keys(contactFieldLimits) as Array<keyof typeof contactFieldLimits>) {
      const input = formRef.current?.elements.namedItem(field);
      if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) input.value = draft[field];
    }
  }, [locale]);

  function saveDraft(formData: FormData, submissionId?: string) {
    saveContactDraft(locale, {
      name: getFormText(formData, "name"),
      email: getFormText(formData, "email"),
      subject: getFormText(formData, "subject"),
      message: getFormText(formData, "message"),
      ...(submissionId ? { submissionId } : {}),
    });
  }

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    await runExclusive(async () => {
      const submissionId = getSubmissionId();
      saveDraft(formData, submissionId);
      setStatus("sending");
      try {
        await sendContactMessage(
          {
            name: getFormText(formData, "name"),
            email: getFormText(formData, "email"),
            subject: getFormText(formData, "subject"),
            message: getFormText(formData, "message"),
            website: getFormText(formData, "website"),
            locale,
          },
          submissionId,
        );
        clearContactDraft(locale, submissionId);
        form.reset();
        resetSubmissionId();
        setStatus("success");
      } catch {
        setStatus("error");
      }
    });
  }

  return (
    <div className={appearance["contact-band"]}>
      <Container as="section" className={appearance["contact-section"]} aria-labelledby="contact-form-title">
        <div className={appearance["contact-heading"]}>
          <h2 id="contact-form-title">{copy.title}</h2>
          <p className={appearance["contact-headingIntro"]}>{copy.intro}</p>
        </div>
        <form
          ref={formRef}
          className={appearance["contact-form"]}
          onSubmit={(event) => {
            void submit(event);
          }}
          onChange={(event) => {
            resetSubmissionId();
            saveDraft(new FormData(event.currentTarget));
            setStatus("idle");
          }}
          aria-busy={status === "sending"}
        >
          <FieldGroup layout="contents">
            <FormField label={copy.name}>
              <Input
                disabled={status === "sending"}
                name="name"
                type="text"
                autoComplete="name"
                maxLength={contactFieldLimits.name}
                required
              />
            </FormField>
            <FormField label={copy.email}>
              <Input
                disabled={status === "sending"}
                name="email"
                type="email"
                autoComplete="email"
                maxLength={contactFieldLimits.email}
                required
              />
            </FormField>
            <FormField label={copy.subject} className="col-span-full compact:col-auto">
              <Input
                disabled={status === "sending"}
                name="subject"
                type="text"
                maxLength={contactFieldLimits.subject}
                required
              />
            </FormField>
            <FormField label={copy.message} className="col-span-full compact:col-auto">
              <Textarea
                disabled={status === "sending"}
                name="message"
                rows={7}
                minLength={10}
                maxLength={contactFieldLimits.message}
                required
              />
            </FormField>
            <HoneypotField />
            <div className={appearance["contact-actions"]}>
              <Button
                className="contact-submit shrink-0 max-[801px]:w-full"
                type="submit"
                disabled={status === "sending"}
              >
                {status === "sending" ? copy.sending : copy.send}
              </Button>
              <Alert className="max-w-[420px]">
                {status === "success" ? copy.success : status === "error" ? copy.error : ""}
              </Alert>
            </div>
          </FieldGroup>
        </form>
      </Container>
    </div>
  );
}
