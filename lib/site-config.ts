import type { Metadata } from "next";

export const SITE_URL = "https://www.modernfundamentalanalyst.com";
export const SITE_NAME = "Modern Fundamental Analyst";
export const SITE_DESCRIPTION = "An independent public-equity portfolio, performance record, and investment memo archive.";

type PageMetadataOptions = {
  title: string;
  description: string;
  path: `/${string}` | "/";
  locale?: "en" | "zh-tw";
};

export function createPageMetadata({ title, description, path, locale = "en" }: PageMetadataOptions): Metadata {
  const englishPath = path;
  const chinesePath = path === "/" ? "/zh-tw" : `/zh-tw${path}`;
  const canonical = locale === "zh-tw" ? chinesePath : englishPath;

  return {
    title: locale === "zh-tw" ? { absolute: `${title}｜${SITE_NAME}` } : title,
    description,
    alternates: {
      canonical,
      languages: {
        en: englishPath,
        "zh-Hant-TW": chinesePath,
        "x-default": englishPath,
      },
    },
  };
}
