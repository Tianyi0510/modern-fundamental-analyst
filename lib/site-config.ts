import type { Metadata } from "next";
import { getLanguageAlternates, getLocalizedPath, type Locale } from "@/lib/i18n";

export const SITE_URL = "https://www.modernfundamentalanalyst.com";
export const SITE_NAME = "Modern Fundamental Analyst";
export const SITE_DESCRIPTION = "An independent public-equity portfolio, performance record, and investment memo archive.";

type PageMetadataOptions = {
  title: string;
  description: string;
  path: `/${string}` | "/";
  locale?: Locale;
};

export function createPageMetadata({ title, description, path, locale = "en" }: PageMetadataOptions): Metadata {
  const canonical = getLocalizedPath(path, locale);
  const fullTitle = locale === "en" ? `${title} | ${SITE_NAME}` : `${title}｜${SITE_NAME}`;
  const image = `${SITE_URL}/og.png`;

  return {
    title: locale === "en" ? title : { absolute: `${title}｜${SITE_NAME}` },
    description,
    openGraph: {
      title: fullTitle, description, url: canonical,
      images: [{ url: image, width: 1728, height: 910, alt: "Ideas compound. Capital follows." }],
    },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [image] },
    alternates: {
      canonical,
      languages: getLanguageAlternates(path),
    },
  };
}
