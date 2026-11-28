import { HeadingPhrases } from "@/components/heading-phrases";
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
      "In these memos, I explain how a business makes money, what I look for in its financial statements, and which risks shape my investment thesis.",
    updated: "Last updated on",
    indexLabel: "View all investment memos",
  },
  "zh-tw": {
    title: ["探討", "企業品質"],
    emphasis: "與財務表現",
    subtitle: "在這些備忘錄裡，我會說明一家公司如何獲利、我讀財報時關注哪些地方，以及哪些風險會影響我的投資判斷。",
    updated: "最後更新於",
    indexLabel: "查看所有投資備忘錄",
  },
  "zh-cn": {
    title: ["探讨", "企业质量"],
    emphasis: "与财务表现",
    subtitle: "在这些备忘录里，我会分析一家公司如何盈利、我读财报时关注哪些问题，以及哪些风险会影响我的投资判断。",
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
              <HeadingPhrases text={text.title} />
              {locale === "en" ? " " : <br />}
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
