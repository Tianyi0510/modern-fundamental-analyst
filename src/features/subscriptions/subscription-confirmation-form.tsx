"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertAction } from "@/components/ui/alert";
import { useExclusiveSubmit } from "@/components/use-exclusive-submit";
import { confirmSubscription } from "./subscription-api";
import { getLocalizedPath, type Locale } from "@/lib/i18n";
import { ButtonLink } from "@/components/button-link";
import { confirmationCopy } from "./confirmation-copy";
import { ClientForm } from "@/components/client-form";

export function SubscriptionConfirmationForm({ token, locale }: { token: string; locale: Locale }) {
  const copy = confirmationCopy[locale];
  const [status, setStatus] = useState<"idle" | "busy" | "success" | "error">("idle");
  const runExclusive = useExclusiveSubmit();
  if (!token)
    return (
      <Alert className="grid justify-items-start gap-4">
        <AlertDescription>{copy.missingLink}</AlertDescription>
        <AlertAction>
          <ButtonLink href={`${getLocalizedPath("/", locale)}#subscribe`}>{copy.newLink}</ButtonLink>
        </AlertAction>
      </Alert>
    );
  return (
    <ClientForm
      locale={locale}
      aria-busy={status === "busy"}
      onSubmit={(event) => {
        event.preventDefault();
        void runExclusive(async () => {
          setStatus("busy");
          try {
            await confirmSubscription({ token });
            setStatus("success");
          } catch {
            setStatus("error");
          }
        });
      }}
    >
      <Button type="submit" disabled={status === "busy" || status === "success"}>
        {status === "busy" ? copy.busy : locale === "en" ? "Confirm Subscription" : copy.action}
      </Button>
      <Alert>{status === "success" ? copy.success : status === "error" ? copy.error : ""}</Alert>
    </ClientForm>
  );
}
