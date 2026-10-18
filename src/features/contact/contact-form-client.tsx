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
import { PostJsonError } from "@/lib/client-post-json";
import { getInvalidContactFields, type ContactField } from "./contact-validation";
import { getFormText } from "@/lib/form-data";
import type { Locale } from "@/lib/i18n";
import { HoneypotField } from "@/components/honeypot-field";
import { useExclusiveSubmit } from "@/components/use-exclusive-submit";
import { useSubmissionId } from "@/components/use-submission-id";
import { clearContactDraft, contactFieldLimits, readContactDraft, saveContactDraft } from "./contact-draft";
import { ClientForm } from "@/components/client-form";

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
  validation: Record<ContactField | "summary", string>;
};

export function ContactFormClient({ copy, locale }: { copy: ContactFormCopy; locale: Locale }) {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error" | "invalid">("idle");
  const [invalidFields, setInvalidFields] = useState<ContactField[]>([]);
  const feedbackRef = useRef<HTMLDivElement>(null);
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
    const form = formRef.current;
    if (!draft || !form) return;
    const restored = { ...draft };
    for (const field of Object.keys(contactFieldLimits) as Array<keyof typeof contactFieldLimits>) {
      const input = form.elements.namedItem(field);
      if (!(input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement)) continue;
      if (input.value === input.defaultValue) input.value = draft[field];
      restored[field] = input.value;
    }
    if ((Object.keys(contactFieldLimits) as ContactField[]).some((field) => restored[field] !== draft[field])) {
      // Autofill or restored browser input belongs to a different submission.
      delete restored.submissionId;
      saveContactDraft(locale, restored);
    }
  }, [locale]);

  useEffect(() => {
    if (status !== "invalid") return;
    const first = invalidFields[0];
    const field = first ? formRef.current?.elements.namedItem(first) : undefined;
    if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) field.focus();
    else feedbackRef.current?.focus();
  }, [status, invalidFields]);

  function saveDraft(formData: FormData, submissionId?: string) {
    saveContactDraft(locale, {
      name: getFormText(formData, "name"),
      email: getFormText(formData, "email"),
      subject: getFormText(formData, "subject"),
      message: getFormText(formData, "message"),
      ...(submissionId ? { submissionId } : {}),
    });
  }

  function validate(form: HTMLFormElement, formData: FormData) {
    const invalidValues = getInvalidContactFields({
      name: getFormText(formData, "name"),
      email: getFormText(formData, "email"),
      subject: getFormText(formData, "subject"),
      message: getFormText(formData, "message"),
    });
    const invalid = (Object.keys(contactFieldLimits) as ContactField[]).filter((field) => {
      const control = form.elements.namedItem(field);
      return (
        invalidValues.includes(field) ||
        ((control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement) && !control.validity.valid)
      );
    });
    setInvalidFields(invalid);
    if (invalid.length > 0) setStatus("invalid");
    return invalid.length === 0;
  }

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    if (!validate(form, formData)) return;
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
      } catch (error) {
        setStatus(error instanceof PostJsonError && error.status === 400 ? "invalid" : "error");
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
        <ClientForm
          locale={locale}
          ref={formRef}
          className={appearance["contact-form"]}
          onSubmit={(event) => {
            void submit(event);
          }}
          onChange={(event) => {
            resetSubmissionId();
            saveDraft(new FormData(event.currentTarget));
            const control = event.target;
            if (control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement) {
              setInvalidFields((fields) => fields.filter((field) => field !== control.name));
            }
            setStatus("idle");
          }}
          onInvalid={(event) => {
            event.preventDefault();
            validate(event.currentTarget, new FormData(event.currentTarget));
          }}
          aria-busy={status === "sending"}
        >
          <FieldGroup layout="contents">
            <FormField error={invalidFields.includes("name") ? copy.validation.name : undefined} label={copy.name}>
              <Input
                disabled={status === "sending"}
                name="name"
                type="text"
                autoComplete="name"
                maxLength={contactFieldLimits.name}
                required
              />
            </FormField>
            <FormField error={invalidFields.includes("email") ? copy.validation.email : undefined} label={copy.email}>
              <Input
                disabled={status === "sending"}
                name="email"
                type="email"
                autoComplete="email"
                maxLength={contactFieldLimits.email}
                required
              />
            </FormField>
            <FormField
              error={invalidFields.includes("subject") ? copy.validation.subject : undefined}
              label={copy.subject}
              className="col-span-full compact:col-auto"
            >
              <Input
                disabled={status === "sending"}
                name="subject"
                type="text"
                maxLength={contactFieldLimits.subject}
                required
              />
            </FormField>
            <FormField
              error={invalidFields.includes("message") ? copy.validation.message : undefined}
              label={copy.message}
              className="col-span-full compact:col-auto"
            >
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
              <Alert ref={feedbackRef} tabIndex={-1} className="max-w-[420px]">
                {status === "success"
                  ? copy.success
                  : status === "error"
                    ? copy.error
                    : status === "invalid"
                      ? copy.validation.summary
                      : ""}
              </Alert>
            </div>
          </FieldGroup>
        </ClientForm>
      </Container>
    </div>
  );
}
