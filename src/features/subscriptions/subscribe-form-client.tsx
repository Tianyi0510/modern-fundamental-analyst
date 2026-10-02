"use client";

import { appearance } from "./subscribe-form-client.styles";
import { FormField } from "@/components/form-field";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

import { useState } from "react";
import type { FormEvent } from "react";
import { PostJsonError } from "@/lib/client-post-json";
import { subscribeToUpdates } from "./subscription-api";
import { getFormText } from "@/lib/form-data";
import type { Locale } from "@/lib/i18n";
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
    <section className={appearance["subscribe-section"]} id="subscribe" aria-labelledby="subscribe-title">
      <h2 id="subscribe-title">{copy.title}</h2>
      <form
        className={appearance["subscribe-form"]}
        onSubmit={(event) => {
          void submit(event);
        }}
        onChange={() => setStatus("idle")}
        aria-busy={status === "submitting"}
      >
        <FormField label={copy.email} visibility="hidden">
          <Input
            disabled={status === "submitting"}
            variant="inverse"
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
          variant="inverse"
          className="subscribe-submit min-w-[7.733em] compact:w-full"
          type="submit"
          disabled={status === "submitting"}
        >
          {status === "submitting" ? copy.submitting : copy.submit}
        </Button>
        <a className={appearance["subscribe-preferences"]} href={preferencesHref}>
          {copy.preferences}
        </a>
        <Alert tone="inverse" className="col-span-full compact:col-auto max-w-[390px]">
          {status === "success"
            ? copy.success
            : status === "alreadySubscribed"
              ? copy.alreadySubscribed
              : status === "error"
                ? copy.error
                : ""}
        </Alert>
      </form>
    </section>
  );
}
