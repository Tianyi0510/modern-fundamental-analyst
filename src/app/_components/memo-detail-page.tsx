import { appearance } from "./memo-detail-page.styles";
import { createMemoStructuredData } from "@/features/memos/memo-pages";
import { notFound } from "next/navigation";
import { MemoArticleContent } from "@/features/memos/memo-article-content";
import { PageFooter } from "@/app/_components/page-footer";
import { SiteHeader } from "@/components/site-header";
import { getMemoContent } from "@/features/memos/memo-content";
import { getMemo } from "@/features/memos/memos";
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
  const structuredData = createMemoStructuredData(slug, locale);
  return (
    <>
      <SiteHeader copy={getNavigationCopy(locale)} locale={locale} />
      <main className="memo-detail-page" id="main-content" tabIndex={-1}>
        {structuredData ? (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />
        ) : null}
        <article className={appearance["memo-article"]}>
          <div className={appearance["memo-article-header-band"]}>
            <header className={appearance["memo-article-header"] + " " + appearance["shell"]}>
              <p className={appearance["eyebrow"]}>
                <span /> {memo.category.label}
              </p>
              <h1>{memo.title}</h1>
              <div className={appearance["article-meta"]}>
                <time dateTime={memo.publishedAt}>{formatDate(memo.publishedAt, locale, locale === "en")}</time>
                <span>{memo.readTime}</span>
                <span>
                  {text.memoLabel} {memo.number}
                </span>
              </div>
            </header>
          </div>
          <div className={appearance["shell"]}>
            <p className={appearance["article-lead"]}>{memo.summary}</p>
            <MemoArticleContent content={content} />
          </div>
        </article>
      </main>
      <PageFooter locale={locale} />
    </>
  );
}
