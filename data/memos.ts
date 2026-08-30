import type { Locale } from "@/lib/i18n";

export const memoCategoryIds = [
  "company-analysis",
  "industry-analysis",
  "monthly-report",
  "annual-report",
] as const;

export type MemoCategoryId = (typeof memoCategoryIds)[number];

export type MemoCategory = {
  id: MemoCategoryId;
  label: string;
};

const memoCategoryLabels = {
  "company-analysis": { en: "Company Analysis", "zh-tw": "企業分析", "zh-cn": "企业分析" },
  "industry-analysis": { en: "Industry Analysis", "zh-tw": "產業分析", "zh-cn": "行业分析" },
  "monthly-report": { en: "Monthly Report", "zh-tw": "月度報告", "zh-cn": "月度报告" },
  "annual-report": { en: "Annual Report", "zh-tw": "年度報告", "zh-cn": "年度报告" },
} satisfies Record<MemoCategoryId, Record<Locale, string>>;

export type MemoSummary = {
  slug: string;
  number: string;
  title: string;
  summary: string;
  publishedAt: string;
  readTime: string;
  category: MemoCategory;
};

const memoCatalog = [
  {
    slug: "microsoft-stock-analysis-fiscal-year-2024",
    number: "001",
    publishedAt: "2025-10-10",
    readTimeMinutes: 12,
    category: "company-analysis",
    locales: {
      en: {
        title: "Microsoft Stock Analysis Fiscal Year 2024",
        summary: "An assessment of Microsoft’s cloud and AI position, Satya Nadella’s leadership, and the company’s fiscal 2024 financial quality.",
      },
      "zh-tw": {
        title: "微軟股票分析：2024 財政年度",
        summary: "評估微軟在雲端與人工智慧領域的競爭地位、Satya Nadella 的領導能力，以及公司 2024 財政年度的財務品質。",
      },
      "zh-cn": {
        title: "微软股票分析：2024 财政年度",
        summary: "评估微软在云计算与人工智能领域的竞争地位、Satya Nadella 的领导能力，以及公司 2024 财政年度的财务质量。",
      },
    },
  },
] as const;

export type MemoSlug = (typeof memoCatalog)[number]["slug"];

function localizeMemos(locale: Locale): MemoSummary[] {
  return memoCatalog.map((memo) => {
    const localized = memo.locales[locale];
    const readTime = locale === "en"
      ? `${memo.readTimeMinutes} min`
      : locale === "zh-tw"
        ? `閱讀 ${memo.readTimeMinutes} 分鐘`
        : `阅读 ${memo.readTimeMinutes} 分钟`;
    return {
      slug: memo.slug,
      number: memo.number,
      publishedAt: memo.publishedAt,
      readTime,
      category: {
        id: memo.category,
        label: memoCategoryLabels[memo.category][locale],
      },
      ...localized,
    };
  });
}

export function getMemoCategories(locale: Locale): readonly MemoCategory[] {
  return memoCategoryIds.map((id) => ({ id, label: memoCategoryLabels[id][locale] }));
}

export const memos = localizeMemos("en");
export const memosZhTw = localizeMemos("zh-tw");
export const memosZhCn = localizeMemos("zh-cn");

const memosByLocale = { en: memos, "zh-tw": memosZhTw, "zh-cn": memosZhCn } as const;

export function getMemos(locale: Locale): readonly MemoSummary[] {
  return memosByLocale[locale];
}

export function getLatestMemo(locale: Locale) {
  return getMemos(locale)[0];
}

export function getMemo(slug: string, locale: Locale) {
  return getMemos(locale).find((memo) => memo.slug === slug);
}

export function getMemoStaticParams() {
  return memoCatalog.map(({ slug }) => ({ slug }));
}
