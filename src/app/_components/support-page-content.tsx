import { PageHero } from "@/components/page-hero";
import { Suspense } from "react";
import { PageFooter } from "@/app/_components/page-footer";
import { SiteHeader } from "@/components/site-header";
import { ServiceLoading } from "@/components/service-loading";
import { SupportPanel, VerifiedSupportPanel } from "@/features/support/support-panel";
import { resolveSupportStatus } from "@/features/support/server/stripe-checkout";
import { isValidCheckoutAttempt } from "@/features/support/server/checkout-attempt";
import { supportCopy } from "@/features/support/support-copy";
import { parseSupportSearchParams, type SupportSearchParams } from "@/features/support/support-config";
import type { Locale } from "@/lib/i18n";
import { getNavigationCopy } from "@/lib/navigation-copy";

export async function SupportPageContent({
  locale,
  searchParams,
}: {
  locale: Locale;
  searchParams: Promise<SupportSearchParams>;
}) {
  const text = supportCopy[locale];
  const parsed = parseSupportSearchParams(await searchParams, locale);
  const params =
    parsed.attemptId && !isValidCheckoutAttempt(parsed.attemptId)
      ? parseSupportSearchParams({ status: "retired-checkout" }, locale)
      : parsed;
  // Ordinary visits and retry errors must expose the native form without a streamed JS swap.
  // Only payment verification can wait on a provider behind the local loading boundary.
  const status = params.status === "success" ? undefined : await resolveSupportStatus(params);
  return (
    <div className="support-page">
      <SiteHeader copy={getNavigationCopy(locale)} locale={locale} languageQuery={params.languageQuery} />
      <main id="main-content" tabIndex={-1}>
        <PageHero
          variant="support"
          label={<>{text.label}</>}
          title={
            <>
              {text.title[0]}
              <br />
              <em>{text.title[1]}</em>
            </>
          }
          intro={
            <>
              <p>{text.intro}</p>
            </>
          }
        />
        {params.status === "success" ? (
          <Suspense key={params.languageQuery} fallback={<ServiceLoading locale={locale} />}>
            <VerifiedSupportPanel locale={locale} params={params} />
          </Suspense>
        ) : (
          <SupportPanel locale={locale} params={params} status={status} />
        )}
      </main>
      <PageFooter locale={locale} />
    </div>
  );
}
