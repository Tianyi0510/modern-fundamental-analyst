import { microsoftMemoContentByLocale, type MemoContent } from "@/content/memos/microsoft-stock-analysis-fiscal-year-2024";
import type { Locale } from "@/lib/i18n";

export type { MemoContent } from "@/content/memos/microsoft-stock-analysis-fiscal-year-2024";

const memoContentBySlug = {
  "microsoft-stock-analysis-fiscal-year-2024": microsoftMemoContentByLocale,
} satisfies Record<string, Record<Locale, MemoContent>>;

export function getMemoContent(slug: string, locale: Locale) {
  return memoContentBySlug[slug as keyof typeof memoContentBySlug]?.[locale];
}
