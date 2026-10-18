import { appearance } from "./memo-article-content.styles";
import { MemoTableOfContents } from "./memo-table-of-contents";
import MicrosoftArticle, { memoTableOfContents } from "./articles/microsoft-stock-analysis-fiscal-year-2024.mdx";
import { memoMdxComponents } from "./memo-mdx-components";
import type { Locale } from "@/lib/i18n";

const articles = {
  "microsoft-stock-analysis-fiscal-year-2024": { Article: MicrosoftArticle, toc: memoTableOfContents },
};

export function MemoArticleContent({ slug, language, locale }: { slug: string; language: Locale; locale: Locale }) {
  const entry = articles[slug as keyof typeof articles];
  if (!entry) return null;
  const { Article, toc } = entry;
  return (
    <>
      <MemoTableOfContents entries={toc} locale={locale} language={language} />
      <div className={appearance["article-body"]} lang={language}>
        <Article components={memoMdxComponents} />
      </div>
    </>
  );
}
