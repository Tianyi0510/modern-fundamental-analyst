import { SiteFooter } from "@/components/site-footer";
import { SubscribeForm } from "@/features/subscriptions/subscribe-form";
import type { Locale } from "@/lib/i18n";

export function PageFooter({ locale }: { locale: Locale }) {
  return <SiteFooter locale={locale} subscription={<SubscribeForm locale={locale} />} />;
}
