"use client";

import { appearance } from "./subscription-preferences-request-form.styles";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/form-field";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";

import { useState, type FormEvent } from "react";
import { PostJsonError } from "@/lib/client-post-json";
import { requestPreferencesLink } from "./subscription-api";
import { getFormText } from "@/lib/form-data";
import type { Locale } from "@/lib/i18n";
import { useExclusiveSubmit } from "@/components/use-exclusive-submit";
import { useSubmissionId } from "@/components/use-submission-id";

export type PreferencesRequestCopy = {
  email: string;
  request: string;
  requesting: string;
  sent: string;
  error: string;
};

export function SubscriptionPreferencesRequestForm({ copy, locale }: { copy: PreferencesRequestCopy; locale: Locale }) {
  const [status, setStatus] = useState<"idle" | "requesting" | "sent" | "error">("idle");
  const runExclusive = useExclusiveSubmit();
  const { getSubmissionId, resetSubmissionId } = useSubmissionId();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = getFormText(new FormData(form), "email");
    await runExclusive(async () => {
      setStatus("requesting");
      try {
        await requestPreferencesLink({ email, locale }, getSubmissionId());
        form.reset();
        resetSubmissionId();
        setStatus("sent");
      } catch (error) {
        if (error instanceof PostJsonError && error.status === 409) resetSubmissionId();
        setStatus("error");
      }
    });
  }

  const message = status === "sent" ? copy.sent : status === "error" ? copy.error : "";
  return (
    <form
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
      <FormField label={copy.email}>
        <Input
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
          className="min-w-0 max-w-full wrap-anywhere"
          disabledFeedback="muted-busy"
          disabled={status === "requesting"}
        >
          {status === "requesting" ? copy.requesting : copy.request}
        </Button>
      </div>
      <Alert className="[overflow-wrap:anywhere]">{message}</Alert>
    </form>
  );
}
