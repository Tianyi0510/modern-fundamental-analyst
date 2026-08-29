import { MemoIndex } from "@/components/memo-index";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getMemos } from "@/data/memos";
import { formatDate } from "@/lib/format";
import { localeConfig, type Locale } from "@/lib/i18n";
import { getNavigationCopy } from "@/lib/navigation-copy";

const copy = {
  en: { eyebrow: "Investment Memos", title: "Detailed Theses for", emphasis: "Independent Investor Evaluation.", subtitle: "Detailed investment theses supported by fundamental research, financial analysis, valuation, and clearly defined material risks.", updated: "Last updated on", indexLabel: "View All Investment Memos" },
  "zh-tw": { eyebrow: "投資備忘錄", title: "供獨立投資者評估的", emphasis: "詳細投資論點。", subtitle: "以基本面研究、財務分析、估值與明確界定的風險為基礎，呈現詳細投資論點。", updated: "最後更新於", indexLabel: "查看所有投資備忘錄" },
  "zh-cn": { eyebrow: "投资备忘录", title: "供独立投资者评估的", emphasis: "详细投资论点。", subtitle: "以基本面研究、财务分析、估值与明确界定的风险为基础，呈现详细投资论点。", updated: "最后更新于", indexLabel: "查看所有投资备忘录" },
} as const;

export function MemoListPage({ locale }: { locale: Locale }) {
  const text = copy[locale];
  const basePath = `${localeConfig[locale].prefix}/memos`;
  const memos = getMemos(locale);
  const latestPublishedAt = memos.reduce((latest, memo) => memo.publishedAt > latest ? memo.publishedAt : latest, "");
  const lastUpdated = latestPublishedAt ? formatDate(latestPublishedAt, locale) : "—";

  return <main className="memos-page" id="main-content"><SiteHeader copy={getNavigationCopy(locale)} locale={locale} />
    <section className="page-hero shell"><p className="eyebrow"><span /> {text.eyebrow}</p><h1>{text.title}<br /><em>{text.emphasis}</em></h1><div className="page-intro"><p>{text.subtitle}</p><small className="date-text">{text.updated} {lastUpdated}</small></div></section>
    <MemoIndex memos={memos} locale={locale} label={text.indexLabel} basePath={basePath} />
    <SiteFooter locale={locale} />
  </main>;
}
