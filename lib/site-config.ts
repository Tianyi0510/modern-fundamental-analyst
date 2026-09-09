import type { Metadata } from "next";
import { getLanguageAlternates, getLocalizedPath, type Locale } from "@/lib/i18n";

export const SITE_URL = "https://www.modernfundamentalanalyst.com";
export const SITE_NAME = "Modern Fundamental Analyst";
export const SITE_DESCRIPTION = "An independent public-equity portfolio, performance record, and investment memo archive.";

const sharingImage = { url: `${SITE_URL}/og.png`, width: 1728, height: 910, alt: "Ideas compound. Capital follows." };

function createSharingMetadata(title: string, description: string, url?: string): Pick<Metadata, "openGraph" | "twitter"> {
  return {
    openGraph: { title, description, ...(url ? { url } : {}), images: [sharingImage] },
    twitter: { card: "summary_large_image", title, description, images: [sharingImage.url] },
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
    icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
    ...createSharingMetadata(title, description),
  };
}

type PageMetadataOptions = {
  title: string;
  description: string;
  path: `/${string}` | "/";
  locale?: Locale;
};

export function createPageMetadata({ title, description, path, locale = "en" }: PageMetadataOptions): Metadata {
  const canonical = getLocalizedPath(path, locale);
  const fullTitle = locale === "en" ? `${title} | ${SITE_NAME}` : `${title}｜${SITE_NAME}`;

  return {
    title: locale === "en" ? title : { absolute: fullTitle },
    description,
    ...createSharingMetadata(fullTitle, description, canonical),
    alternates: {
      canonical,
      languages: getLanguageAlternates(path),
    },
  };
}
