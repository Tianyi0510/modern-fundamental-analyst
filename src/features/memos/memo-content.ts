import type { Locale } from "@/lib/i18n";

// Keep metadata independent of MDX rendering so API and email paths load only the catalog.
const englishOriginal = { language: "en" as const };
const contentBySlug = {
  "microsoft-stock-analysis-fiscal-year-2024": {
    en: englishOriginal,
    "zh-tw": englishOriginal,
    "zh-cn": englishOriginal,
  },
};

export function getMemoContent(slug: string, locale: Locale) {
  return contentBySlug[slug as keyof typeof contentBySlug]?.[locale];
}
