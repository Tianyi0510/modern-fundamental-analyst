"use client";

import { FormPanel } from "@/components/form-panel";
import { appearance } from "./subscribe-form-client.styles";
import { FieldGroup } from "@/components/ui/field";
import { FormField } from "@/components/form-field";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

import { useEffect, useRef, useState } from "react";
import type { SubmitEvent } from "react";
import { PostJsonError } from "@/lib/client-post-json";
import { subscribeToUpdates } from "./subscription-api";
import { getFormText } from "@/lib/form-data";
import { isValidEmail } from "@/lib/email-validation";
import type { Locale } from "@/lib/i18n";
import { HoneypotField } from "@/components/honeypot-field";
import { useSubmissionId } from "@/components/use-submission-id";
import { useExclusiveSubmit } from "@/components/use-exclusive-submit";
import { ClientForm } from "@/components/client-form";

export type SubscribeFormCopy = {
  title: string;
  email: string;
  placeholder: string;
  submit: string;
  submitting: string;
  success: string;
  alreadySubscribed: string;
  error: string;
  invalidEmail: string;
  preferences: string;
};

type Status = "idle" | "submitting" | "success" | "alreadySubscribed" | "error" | "invalid";

export function SubscribeFormClient({
  copy,
  locale,
  preferencesHref,
  variant = "inverse",
  id = "subscribe",
  intro,
}: {
  copy: SubscribeFormCopy;
  locale: Locale;
  preferencesHref: string;
  variant?: "standard" | "inverse";
  id?: string;
  intro?: string;
}) {
  const titleId = `${id}-title`;
  const [status, setStatus] = useState<Status>("idle");
  const emailRef = useRef<HTMLInputElement>(null);
  const { getSubmissionId, resetSubmissionId } = useSubmissionId();
  const runExclusive = useExclusiveSubmit();

  useEffect(() => {
    if (status === "invalid") emailRef.current?.focus();
  }, [status]);

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    if (!isValidEmail(getFormText(formData, "email").trim())) {
      setStatus("invalid");
      emailRef.current?.focus();
      return;
    }

    await runExclusive(async () => {
      setStatus("submitting");
      try {
        await subscribeToUpdates(
          {
            email: getFormText(formData, "email"),
            website: getFormText(formData, "website"),
            locale,
          },
          getSubmissionId(),
        );
        form.reset();
        resetSubmissionId();
        setStatus("success");
      } catch (error) {
        if (error instanceof PostJsonError && (error.status === 409 || error.status === 422)) resetSubmissionId();
        setStatus(
          error instanceof PostJsonError && error.status === 400
            ? "invalid"
            : error instanceof PostJsonError && error.status === 409
              ? "alreadySubscribed"
              : "error",
        );
      }
    });
  }

  return (
    <section className={appearance.section[variant]} id={id} aria-labelledby={titleId}>
      <header>
        <h2 id={titleId}>{copy.title}</h2>
        {intro ? <p className={appearance.intro}>{intro}</p> : null}
      </header>
      <FormPanel variant={variant}>
        <ClientForm
          locale={locale}
          className={cn(appearance["subscribe-form"], variant === "inverse" && "mt-[var(--space-footer-heading)]")}
          onSubmit={(event) => {
            void submit(event);
          }}
          onChange={() => {
            resetSubmissionId();
            setStatus("idle");
          }}
          aria-busy={status === "submitting"}
        >
          <FieldGroup layout="contents">
            <FormField
              label={copy.email}
              visibility={variant === "inverse" ? "hidden" : "visible"}
              error={status === "invalid" ? copy.invalidEmail : undefined}
            >
              <Input
                ref={emailRef}
                disabled={status === "submitting"}
                variant={variant}
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder={copy.placeholder}
                maxLength={254}
                required
              />
            </FormField>
            <HoneypotField />
            <Button
              variant={variant === "inverse" ? "inverse" : "primary"}
              className={cn(
                "subscribe-submit min-w-[7.733em] compact:w-full",
                variant === "standard" ? "self-end" : "[--action-inverse-text:var(--black)]",
              )}
              type="submit"
              disabled={status === "submitting"}
            >
              {status === "submitting" && <Spinner aria-hidden="true" data-icon="inline-start" />}
              {copy.submit}
            </Button>
            <a className={appearance.preferences[variant]} href={preferencesHref}>
              {copy.preferences}
            </a>
            <Alert tone={variant} className="col-span-full max-w-[390px] compact:col-auto">
              {status === "submitting"
                ? copy.submitting
                : status === "success"
                  ? copy.success
                  : status === "alreadySubscribed"
                    ? copy.alreadySubscribed
                    : status === "error"
                      ? copy.error
                      : ""}
            </Alert>
          </FieldGroup>
        </ClientForm>
      </FormPanel>
    </section>
  );
}
