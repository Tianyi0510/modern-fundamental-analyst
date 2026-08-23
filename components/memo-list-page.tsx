import { MemoIndex } from "@/components/memo-index";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getMemos } from "@/data/memos";
import { localeConfig, type Locale } from "@/lib/i18n";

const copy = {
  en: { eyebrow: "Investment Memos", title: "Detailed Theses for", emphasis: "Independent Investor Evaluation.", indexLabel: "View All Investment Memos" },
  "zh-tw": { eyebrow: "投資備忘錄", title: "供獨立投資者評估的", emphasis: "詳細投資論點。", indexLabel: "查看所有投資備忘錄" },
  "zh-cn": { eyebrow: "投资备忘录", title: "供独立投资者评估的", emphasis: "详细投资论点。", indexLabel: "查看所有投资备忘录" },
} as const;

export function MemoListPage({ locale }: { locale: Locale }) {
  const text = copy[locale];
  const basePath = `${localeConfig[locale].prefix}/memos`;

  return <main className="memos-page"><SiteHeader locale={locale} />
    <section className="page-hero shell"><p className="eyebrow"><span /> {text.eyebrow}</p><h1>{text.title}<br /><em>{text.emphasis}</em></h1></section>
    <MemoIndex memos={getMemos(locale)} locale={locale} label={text.indexLabel} basePath={basePath} />
    <SiteFooter locale={locale} />
  </main>;
}
