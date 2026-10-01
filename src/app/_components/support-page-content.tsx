import { Suspense } from "react";
import { PageFooter } from "@/app/_components/page-footer";
import { SiteHeader } from "@/components/site-header";
import { ServiceLoading } from "@/components/service-loading";
import { SupportPanel } from "@/features/support/support-panel";
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
  const params = parseSupportSearchParams(await searchParams, locale);
  return (
    <div className="support-page">
      <SiteHeader copy={getNavigationCopy(locale)} locale={locale} languageQuery={params.languageQuery} />
      <main id="main-content" tabIndex={-1}>
        <div className="page-hero-band">
          <section className="page-hero support-hero shell">
            <p className="eyebrow">
              <span /> {text.label}
            </p>
            <h1>
              {text.title[0]}
              <br />
              <em>{text.title[1]}</em>
            </h1>
            <div className="page-intro">
              <p>{text.intro}</p>
            </div>
          </section>
        </div>
        <Suspense key={params.languageQuery} fallback={<ServiceLoading locale={locale} />}>
          <SupportPanel locale={locale} params={params} />
        </Suspense>
      </main>
      <PageFooter locale={locale} />
    </div>
  );
}
