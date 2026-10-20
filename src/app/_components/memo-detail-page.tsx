import { appearance } from "./memo-detail-page.styles";
import { createMemoBreadcrumbStructuredData, createMemoStructuredData } from "@/features/memos/memo-pages";
import { notFound } from "next/navigation";
import { MemoShare } from "@/features/memos/memo-share";
import { MemoArticleContent } from "@/features/memos/memo-article-content";
import { PageFooter } from "@/app/_components/page-footer";
import { SiteHeader } from "@/components/site-header";
import { getMemoContent } from "@/features/memos/memo-content";
import { getMemo } from "@/features/memos/memos";
import { formatDate } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { getNavigationCopy } from "@/lib/navigation-copy";

const copy = {
  en: {
    memoLabel: "Investment memo",
    languageNotice: "This article is available in English only; no translation is available.",
    disclaimerTitle: "Disclaimer",
  },
  "zh-tw": {
    memoLabel: "投資備忘錄",
    languageNotice: "本文目前僅提供英文原文，尚無中文譯文。",
    disclaimerTitle: "免責聲明",
  },
  "zh-cn": {
    memoLabel: "投资备忘录",
    languageNotice: "本文目前仅提供英文原文，尚无中文译文。",
    disclaimerTitle: "免责声明",
  },
} as const;

export function MemoDetailPage({ locale, slug }: { locale: Locale; slug: string }) {
  const memo = getMemo(slug, locale);
  const content = getMemoContent(slug, locale);
  if (!memo || !content) notFound();

  const text = copy[locale];
  const structuredData = createMemoStructuredData(slug, locale);
  const breadcrumb = createMemoBreadcrumbStructuredData(slug, locale);
  return (
    <>
      <SiteHeader copy={getNavigationCopy(locale)} locale={locale} />
      <main className="memo-detail-page" id="main-content" tabIndex={-1}>
        {structuredData ? (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />
        ) : null}
        {breadcrumb ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumb }} /> : null}
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
                <div className="ml-auto flex justify-end compact:ml-0 compact:basis-full compact:justify-start">
                  <MemoShare locale={locale} />
                </div>
              </div>
            </header>
          </div>
          <div className={appearance["shell"] + " memo-article-body py-[var(--space-section-padding)]"}>
            <p className={appearance["article-lead"]}>{memo.summary}</p>
            {content.language !== locale ? (
              <p className={appearance["article-notes"] + " memo-language-notice"}>{text.languageNotice}</p>
            ) : null}
            <MemoArticleContent slug={slug} language={content.language} locale={locale} />
            <aside className={appearance["article-disclaimer"]} aria-labelledby="memo-disclaimer-title">
              <h2 id="memo-disclaimer-title" className="mb-[var(--space-3)] text-medium-title">
                {text.disclaimerTitle}
              </h2>
              <p>{memo.scopeNote}</p>
            </aside>
          </div>
        </article>
      </main>
      <PageFooter locale={locale} />
    </>
  );
}
