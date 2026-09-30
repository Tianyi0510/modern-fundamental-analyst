"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export function SupportCheckoutForm({
  children,
  submit,
  submitting,
  note,
}: {
  children: ReactNode;
  submit: string;
  submitting: string;
  note: ReactNode;
}) {
  const locked = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // A browser Back navigation may restore this form from the page cache.
    const reset = () => {
      locked.current = false;
      setIsSubmitting(false);
    };
    window.addEventListener("pageshow", reset);
    return () => window.removeEventListener("pageshow", reset);
  }, []);

  return (
    <form
      className="support-form"
      action="/api/stripe/checkout"
      method="post"
      aria-busy={isSubmitting}
      onSubmit={(event) => {
        if (locked.current) {
          event.preventDefault();
          return;
        }
        locked.current = true;
        setIsSubmitting(true);
      }}
    >
      {children}
      <button className="button button-dark support-submit" type="submit" disabled={isSubmitting} aria-live="polite">
        {isSubmitting ? submitting : submit}
      </button>
      {note}
    </form>
  );
}
