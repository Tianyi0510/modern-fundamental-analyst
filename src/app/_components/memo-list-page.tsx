import { PageHero } from "@/components/page-hero";
import { appearance } from "./memo-list-page.styles";
import { MemoIndex } from "@/features/memos/memo-index";
import { PageFooter } from "@/app/_components/page-footer";
import { SiteHeader } from "@/components/site-header/site-header";
import { getMemos } from "@/features/memos/memos";
import { formatDate } from "@/lib/format";
import { type Locale } from "@/lib/i18n";
import { getNavigationCopy } from "@/lib/navigation-copy";

const copy = {
  en: {
    title: "Research on business quality",
    emphasis: "and financial performance",
    subtitle:
      "Explore Microsoft’s cloud and AI position, leadership, and fiscal 2024 financial quality. This historical article does not include a published valuation model.",
    updated: "Last updated on",
    indexLabel: "View all investment memos",
  },
  "zh-tw": {
    title: "探討企業品質",
    emphasis: "與財務表現",
    subtitle: "檢視微軟在雲端與 AI 領域的地位、領導層，以及 2024 財政年度的財務品質。這篇歷史文章未附公開的估值模型。",
    updated: "最後更新於",
    indexLabel: "查看所有投資備忘錄",
  },
  "zh-cn": {
    title: "探讨企业质量",
    emphasis: "与财务表现",
    subtitle:
      "检视微软在云计算与 AI 领域的地位、领导层，以及 2024 财政年度的财务质量。这篇历史文章未附公开的估值模型。",
    updated: "最后更新于",
    indexLabel: "查看所有投资备忘录",
  },
} as const;

export function MemoListPage({ locale }: { locale: Locale }) {
  const text = copy[locale];
  const memos = getMemos(locale);
  const previews = memos.map(({ slug, number, title, summary, publishedAt, readTime, category }) => ({
    slug,
    number,
    title,
    summary,
    publishedAt,
    readTime,
    category,
  }));
  const latestPublishedAt = memos.reduce((latest, memo) => (memo.publishedAt > latest ? memo.publishedAt : latest), "");
  const lastUpdated = latestPublishedAt ? formatDate(latestPublishedAt, locale) : "—";

  return (
    <div className="memos-page">
      <SiteHeader copy={getNavigationCopy(locale)} locale={locale} />
      <main id="main-content" tabIndex={-1}>
        <PageHero
          variant="standard"
          title={
            <>
              {text.title}
              <br />
              <em>{text.emphasis}</em>
            </>
          }
          intro={
            <>
              <p>{text.subtitle}</p>
              <small className={appearance["date-text"]}>
                {text.updated}{" "}
                {latestPublishedAt ? <time dateTime={latestPublishedAt}>{lastUpdated}</time> : lastUpdated}
              </small>
            </>
          }
        />
        <MemoIndex memos={previews} locale={locale} label={text.indexLabel} />
      </main>
      <PageFooter locale={locale} />
    </div>
  );
}
