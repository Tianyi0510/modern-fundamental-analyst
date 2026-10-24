import type { Locale } from "@/lib/i18n";

const categoryLabels = {
  "company-analysis": { en: "Company analysis", "zh-tw": "企業分析", "zh-cn": "企业分析" },
  "industry-analysis": { en: "Industry analysis", "zh-tw": "產業分析", "zh-cn": "行业分析" },
  "quarterly-report": { en: "Quarterly report", "zh-tw": "季度報告", "zh-cn": "季度报告" },
  "annual-report": { en: "Annual report", "zh-tw": "年度報告", "zh-cn": "年度报告" },
  blogs: { en: "Blog", "zh-tw": "網誌", "zh-cn": "博客" },
} as const satisfies Record<string, Record<Locale, string>>;

export type MemoCategoryId = keyof typeof categoryLabels;
export type MemoCategory = { id: MemoCategoryId; label: string };

export function getMemoCategories(locale: Locale): MemoCategory[] {
  return (Object.keys(categoryLabels) as MemoCategoryId[]).map((id) => ({
    id,
    label: categoryLabels[id][locale],
  }));
}

export function getMemoCategory(id: MemoCategoryId, locale: Locale): MemoCategory {
  return { id, label: categoryLabels[id][locale] };
}

export function readMemoCategory(value: string | null): MemoCategoryId | "all" {
  return value !== null && Object.hasOwn(categoryLabels, value) ? (value as MemoCategoryId) : "all";
}
