"use client";

import { appearance } from "./subscription-preferences-request-form.styles";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { FormField } from "@/components/form-field";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";

import { useEffect, useRef, useState, type SubmitEvent } from "react";
import { PostJsonError } from "@/lib/client-post-json";
import { requestPreferencesLink } from "./subscription-api";
import { getFormText } from "@/lib/form-data";
import { isValidEmail } from "@/lib/email-validation";
import type { Locale } from "@/lib/i18n";
import { useExclusiveSubmit } from "@/components/use-exclusive-submit";
import { useSubmissionId } from "@/components/use-submission-id";
import { ClientForm } from "@/components/client-form";

export type PreferencesRequestCopy = {
  email: string;
  request: string;
  requesting: string;
  sent: string;
  error: string;
  invalidEmail: string;
};

export function SubscriptionPreferencesRequestForm({ copy, locale }: { copy: PreferencesRequestCopy; locale: Locale }) {
  const [status, setStatus] = useState<"idle" | "requesting" | "sent" | "error" | "invalid">("idle");
  const emailRef = useRef<HTMLInputElement>(null);
  const runExclusive = useExclusiveSubmit();
  const { getSubmissionId, resetSubmissionId } = useSubmissionId();

  useEffect(() => {
    if (status === "invalid") emailRef.current?.focus();
  }, [status]);

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = getFormText(new FormData(form), "email");
    if (!isValidEmail(email.trim())) {
      setStatus("invalid");
      emailRef.current?.focus();
      return;
    }
    await runExclusive(async () => {
      setStatus("requesting");
      try {
        await requestPreferencesLink({ email, locale }, getSubmissionId());
        form.reset();
        resetSubmissionId();
        setStatus("sent");
      } catch (error) {
        if (error instanceof PostJsonError && error.status === 409) resetSubmissionId();
        setStatus(error instanceof PostJsonError && error.status === 400 ? "invalid" : "error");
      }
    });
  }

  const message = status === "sent" ? copy.sent : status === "error" ? copy.error : "";
  return (
    <ClientForm
      locale={locale}
      className={appearance["preferences-form"]}
      onSubmit={(event) => {
        void submit(event);
      }}
      onChange={() => {
        resetSubmissionId();
        setStatus("idle");
      }}
      aria-busy={status === "requesting"}
    >
      <FieldGroup layout="contents">
        <FormField label={copy.email} error={status === "invalid" ? copy.invalidEmail : undefined}>
          <Input
            ref={emailRef}
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            maxLength={254}
            disabled={status === "requesting"}
            required
          />
        </FormField>
        <div className={appearance["preferences-actions"]}>
          <Button
            type="submit"
            className="max-w-full min-w-0 wrap-anywhere"
            disabledFeedback="muted-busy"
            disabled={status === "requesting"}
          >
            {status === "requesting" ? copy.requesting : copy.request}
          </Button>
        </div>
        <Alert className="[overflow-wrap:anywhere]">{message}</Alert>
      </FieldGroup>
    </ClientForm>
  );
}
