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
  initialChoice,
  recovering,
}: {
  children: ReactNode;
  submit: string;
  submitting: string;
  note: ReactNode;
  attemptId: string;
  resume: string;
  recovery: string;
  initialChoice: string;
  recovering: boolean;
}) {
  const locked = useRef(false);
  const choiceRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedChoice, setSubmittedChoice] = useState<string | null>(recovering ? initialChoice : null);

  useEffect(() => {
    // A browser Back navigation may restore this form from the page cache.
    const reset = (event: PageTransitionEvent) => {
      if (!locked.current) return;
      if (event.persisted) {
        // A fresh attempt must be issued by the server, never minted in the browser.
        window.location.reload();
        return;
      }
      locked.current = false;
      const form = choiceRef.current?.form;
      const fieldset = form?.querySelector("fieldset");
      if (fieldset) fieldset.disabled = false;
      if (choiceRef.current) choiceRef.current.disabled = true;
      setSubmittedChoice(null);
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
        if (!locked.current && choiceRef.current) {
          // Freeze the submitted product/version for an idempotent retry, without disabling the native payload.
          const choice = new FormData(form).get("product_id");
          choiceRef.current.value = typeof choice === "string" ? choice : "";
          setSubmittedChoice(choiceRef.current.value);
          choiceRef.current.disabled = false;
          if (fieldset) fieldset.disabled = true;
        }
        locked.current = true;
        setIsSubmitting(true);
      }}
    >
      <input type="hidden" name="checkout_attempt" value={attemptId} />
      <input
        type="hidden"
        name="product_id"
        ref={choiceRef}
        disabled={submittedChoice === null}
        value={submittedChoice ?? ""}
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
