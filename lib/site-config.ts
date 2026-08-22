import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n";

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
  const englishPath = path;
  const traditionalChinesePath = path === "/" ? "/zh-tw" : `/zh-tw${path}`;
  const simplifiedChinesePath = path === "/" ? "/zh-cn" : `/zh-cn${path}`;
  const canonical = locale === "zh-tw" ? traditionalChinesePath : locale === "zh-cn" ? simplifiedChinesePath : englishPath;

  return {
    title: locale === "en" ? title : { absolute: `${title}｜${SITE_NAME}` },
    description,
    alternates: {
      canonical,
      languages: {
        en: englishPath,
        "zh-Hant-TW": traditionalChinesePath,
        "zh-Hans-CN": simplifiedChinesePath,
        "x-default": englishPath,
      },
    },
  };
}
