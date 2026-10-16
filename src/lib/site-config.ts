import type { Metadata } from "next";
import { getLanguageAlternates, getLocalizedPath, locales, type Locale } from "@/lib/i18n";

export const SITE_URL = "https://www.modernfundamentalanalyst.com";
export const SITE_NAME = "Modern Fundamental Analyst";
const SITE_DESCRIPTION = "An independent public-equity portfolio, performance record, and investment memo archive.";

const openGraphLocales: Record<Locale, string> = { en: "en_US", "zh-tw": "zh_TW", "zh-cn": "zh_CN" };

export function createWebsiteStructuredData(): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
  }).replace(/</g, "\\u003c");
}

const sharingImage = {
  url: `${SITE_URL}/og-logo.png`,
  width: 1200,
  height: 630,
  alt: "Modern Fundamental Analyst logo",
};

function createSharingMetadata(
  title: string,
  description: string,
  url: string,
  locale: Locale,
): Pick<Metadata, "openGraph" | "twitter"> {
  return {
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      locale: openGraphLocales[locale],
      alternateLocale: locales.filter((target) => target !== locale).map((target) => openGraphLocales[target]),
      images: [sharingImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: sharingImage.url, alt: sharingImage.alt }],
    },
  };
}

const rootCopy = {
  en: { title: SITE_NAME, description: SITE_DESCRIPTION },
  "zh-tw": { title: `${SITE_NAME}｜繁體中文`, description: "獨立公開市場股票研究、投資組合、績效紀錄與投資備忘錄。" },
  "zh-cn": { title: `${SITE_NAME}｜简体中文`, description: "独立公开市场股票研究、投资组合、业绩记录与投资备忘录。" },
};

export function createRootMetadata(locale: Locale): Metadata {
  const { title, description } = rootCopy[locale];
  return {
    metadataBase: new URL(SITE_URL),
    title: locale === "en" ? { default: title, template: `%s | ${SITE_NAME}` } : { absolute: title },
    description,
    alternates: { canonical: getLocalizedPath("/", locale), languages: getLanguageAlternates("/") },
    ...createSharingMetadata(title, description, getLocalizedPath("/", locale), locale),
  };
}

type PageMetadataOptions = {
  title: string;
  description: string;
  path: `/${string}` | "/";
  locale?: Locale;
  indexable?: boolean;
};

export function createPageMetadata({
  title,
  description,
  path,
  locale = "en",
  indexable = true,
}: PageMetadataOptions): Metadata {
  const canonical = getLocalizedPath(path, locale);
  const fullTitle = locale === "en" ? `${title} | ${SITE_NAME}` : `${title}｜${SITE_NAME}`;

  return {
    title: locale === "en" ? title : { absolute: fullTitle },
    description,
    ...createSharingMetadata(fullTitle, description, canonical, locale),
    alternates: {
      canonical,
      ...(indexable ? { languages: getLanguageAlternates(path) } : {}),
    },
    ...(!indexable ? { robots: { index: false, follow: false } } : {}),
  };
}
