import { SiteHeader } from "@/components/site-header";
import { PageHero } from "@/components/page-hero";
import { Container } from "@/components/container";
import { PageFooter } from "./page-footer";
import { getNavigationCopy } from "@/lib/navigation-copy";
import { getLocalizedPath, type Locale } from "@/lib/i18n";
import { confirmationCopy } from "@/features/subscriptions/confirmation-copy";
import { SubscriptionConfirmationForm } from "@/features/subscriptions/subscription-confirmation-form";

const pageBody: Record<Locale, string> = {
  en: "Confirm that you want to receive updates from Modern Fundamental Analyst. This link expires in 24 hours.",
  "zh-tw": "請確認你希望接收 Modern Fundamental Analyst 的更新。此連結將於 24 小時後到期。",
  "zh-cn": "请确认你希望接收 Modern Fundamental Analyst 的更新。此链接将于 24 小时后到期。",
};

export async function SubscriptionConfirmationPage({
  locale,
  searchParams,
}: {
  locale: Locale;
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const params = await searchParams;
  const token = typeof params.token === "string" && /^[A-Za-z0-9_-]{43}$/.test(params.token) ? params.token : "";
  const copy = confirmationCopy[locale];
  const title = locale === "en" ? "Confirm Your Subscription" : copy.heading;
  return (
    <div>
      <SiteHeader
        copy={getNavigationCopy(locale)}
        locale={locale}
        languageQuery={token ? new URLSearchParams({ token }).toString() : undefined}
      />
      <main id="main-content" tabIndex={-1}>
        <PageHero variant="standard" title={title} intro={<p>{pageBody[locale]}</p>} />
        <Container className="confirmation-panel grid gap-6 py-[var(--space-section-padding)]">
          <SubscriptionConfirmationForm token={token} locale={locale} />
          <a href={`${getLocalizedPath("/", locale)}#subscribe`}>{getNavigationCopy(locale).home}</a>
        </Container>
      </main>
      <PageFooter locale={locale} />
    </div>
  );
}
