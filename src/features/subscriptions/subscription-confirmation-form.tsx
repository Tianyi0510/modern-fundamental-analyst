"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { useExclusiveSubmit } from "@/components/use-exclusive-submit";
import { confirmSubscription } from "./subscription-api";
import type { Locale } from "@/lib/i18n";
import { confirmationCopy } from "./confirmation-copy";

export function SubscriptionConfirmationForm({ token, locale }: { token: string; locale: Locale }) {
  const copy = confirmationCopy[locale];
  const [status, setStatus] = useState<"idle" | "busy" | "success" | "error">("idle");
  const runExclusive = useExclusiveSubmit();
  return (
    <form
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
      <Button type="submit" disabled={!token || status === "busy" || status === "success"}>
        {status === "busy" ? copy.busy : copy.action}
      </Button>
      <Alert>{status === "success" ? copy.success : status === "error" || !token ? copy.error : ""}</Alert>
    </form>
  );
}
