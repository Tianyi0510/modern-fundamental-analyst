import { notFound } from "next/navigation";
import { MemoArticleContent } from "@/components/memo-article-content";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getMemoContent } from "@/data/memo-content";
import { getMemo } from "@/data/memos";
import { formatDate } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { getNavigationCopy } from "@/lib/navigation-copy";

const copy = {
  en: { memoLabel: "Investment Memo" },
  "zh-tw": { memoLabel: "投資備忘錄" },
  "zh-cn": { memoLabel: "投资备忘录" },
} as const;

export function MemoDetailPage({ locale, slug }: { locale: Locale; slug: string }) {
  const memo = getMemo(slug, locale);
  const content = getMemoContent(slug, locale);
  if (!memo || !content) notFound();

  const text = copy[locale];
  return <>
    <SiteHeader copy={getNavigationCopy(locale)} locale={locale} />
    <main className="memo-detail-page" id="main-content">
      <article className="memo-article shell">
        <header className="memo-article-header"><p className="eyebrow"><span /> {memo.category.label}</p><h1>{memo.title}</h1><div className="article-meta"><span>{formatDate(memo.publishedAt, locale, locale === "en")}</span><span>{memo.readTime}</span><span>{text.memoLabel} {memo.number}</span></div></header>
        <p className="article-lead">{memo.summary}</p>
        <MemoArticleContent content={content} />
      </article>
    </main>
    <SiteFooter locale={locale} />
  </>;
}
