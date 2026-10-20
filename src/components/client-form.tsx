"use client";

import type { ComponentProps } from "react";
import type { Locale } from "@/lib/i18n";
import { useHydrated } from "./use-hydrated";
import { ClientFormNotice } from "./client-form-notice";

export function ClientForm({ children, locale, ...props }: ComponentProps<"form"> & { locale: Locale }) {
  const hydrated = useHydrated();
  return (
    <form {...props} method="post">
      {/* Keep native controls inert until their submission handler is attached. */}
      <fieldset disabled={!hydrated} className="contents">
        {children}
      </fieldset>
      <ClientFormNotice locale={locale} />
    </form>
  );
}
