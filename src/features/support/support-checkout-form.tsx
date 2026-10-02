"use client";

import { appearance } from "./support-checkout-form.styles";
import { Button } from "@/components/ui/button";

import { useEffect, useRef, useState, type ReactNode } from "react";

export function SupportCheckoutForm({
  children,
  submit,
  submitting,
  note,
  attemptId,
  resume,
  recovery,
  initialAmount,
  recovering,
}: {
  children: ReactNode;
  submit: string;
  submitting: string;
  note: ReactNode;
  attemptId: string;
  resume: string;
  recovery: string;
  initialAmount: string;
  recovering: boolean;
}) {
  const locked = useRef(false);
  const amountRef = useRef<HTMLInputElement>(null);
  const attemptRef = useRef<HTMLInputElement>(null);
  const [currentAttempt, setCurrentAttempt] = useState(attemptId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedAmount, setSubmittedAmount] = useState<string | null>(recovering ? initialAmount : null);

  useEffect(() => {
    // A browser Back navigation may restore this form from the page cache.
    const reset = (event: PageTransitionEvent) => {
      if (!locked.current) return;
      if (event.persisted && attemptRef.current) {
        const nextAttempt = crypto.randomUUID();
        attemptRef.current.value = nextAttempt;
        setCurrentAttempt(nextAttempt);
      }
      locked.current = false;
      const form = amountRef.current?.form;
      const fieldset = form?.querySelector("fieldset");
      if (fieldset) fieldset.disabled = false;
      if (amountRef.current) amountRef.current.disabled = true;
      setSubmittedAmount(null);
      setIsSubmitting(false);
    };
    window.addEventListener("pageshow", reset);
    return () => window.removeEventListener("pageshow", reset);
  }, []);

  return (
    <form
      className={appearance["support-form"]}
      action="/api/stripe/checkout"
      method="post"
      aria-busy={isSubmitting}
      onSubmit={(event) => {
        const submitter = event.nativeEvent.submitter;
        if (locked.current && submitter?.getAttribute("name") !== "checkout_resume") {
          event.preventDefault();
          return;
        }
        const form = event.currentTarget;
        const fieldset = form.querySelector("fieldset");
        if (!locked.current && amountRef.current) {
          // Freeze the submitted amount for an idempotent retry, without disabling the native payload.
          const amount = new FormData(form).get("amount");
          amountRef.current.value = typeof amount === "string" ? amount : "";
          setSubmittedAmount(amountRef.current.value);
          amountRef.current.disabled = false;
          if (fieldset) fieldset.disabled = true;
        }
        locked.current = true;
        setIsSubmitting(true);
      }}
    >
      <input type="hidden" name="checkout_attempt" ref={attemptRef} value={currentAttempt} />
      <input
        type="hidden"
        name="amount"
        ref={amountRef}
        disabled={submittedAmount === null}
        value={submittedAmount ?? ""}
      />
      {children}
      <Button className={appearance["support-submit"]} type="submit" disabled={isSubmitting} aria-live="polite">
        {isSubmitting ? submitting : submit}
      </Button>
      {isSubmitting ? (
        <div className={appearance["support-status"]} role="status">
          <p>{recovery}</p>
          <Button className={appearance["support-submit"]} type="submit" name="checkout_resume" value="1">
            {resume}
          </Button>
        </div>
      ) : null}
      {note}
    </form>
  );
}
