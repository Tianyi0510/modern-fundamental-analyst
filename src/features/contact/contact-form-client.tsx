"use client";

import { appearance } from "./contact-form-client.styles";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/container";
import { FormField } from "@/components/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert";

import { useState } from "react";
import type { FormEvent } from "react";
import { sendContactMessage } from "./contact-api";
import { getFormText } from "@/lib/form-data";
import type { Locale } from "@/lib/i18n";
import { HoneypotField } from "@/components/honeypot-field";
import { useExclusiveSubmit } from "@/components/use-exclusive-submit";
import { useSubmissionId } from "@/components/use-submission-id";

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
  const { getSubmissionId, resetSubmissionId } = useSubmissionId();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    await runExclusive(async () => {
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
          getSubmissionId(),
        );
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
          className={appearance["contact-form"]}
          onSubmit={(event) => {
            void submit(event);
          }}
          onChange={() => {
            resetSubmissionId();
            setStatus("idle");
          }}
          aria-busy={status === "sending"}
        >
          <FormField label={copy.name}>
            <Input
              disabled={status === "sending"}
              name="name"
              type="text"
              autoComplete="name"
              maxLength={100}
              required
            />
          </FormField>
          <FormField label={copy.email}>
            <Input
              disabled={status === "sending"}
              name="email"
              type="email"
              autoComplete="email"
              maxLength={254}
              required
            />
          </FormField>
          <FormField label={copy.subject} className="col-span-full compact:col-auto">
            <Input disabled={status === "sending"} name="subject" type="text" maxLength={160} required />
          </FormField>
          <FormField label={copy.message} className="col-span-full compact:col-auto">
            <Textarea
              disabled={status === "sending"}
              name="message"
              rows={7}
              minLength={10}
              maxLength={5000}
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
        </form>
      </Container>
    </div>
  );
}
