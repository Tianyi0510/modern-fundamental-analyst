import { SiteFooter } from "@/components/site-footer";
import { SubscribeForm } from "@/features/subscriptions/subscribe-form";
import type { Locale } from "@/lib/i18n";
import { Suspense } from "react";

export function PageFooter({ locale }: { locale: Locale }) {
  return (
    <Suspense fallback={null}>
      <SiteFooter locale={locale} subscription={<SubscribeForm locale={locale} />} />
    </Suspense>
  );
}
