import { appearance } from "./memo-article-content.styles";
import MicrosoftArticle from "./articles/microsoft-stock-analysis-fiscal-year-2024.mdx";
import { memoMdxComponents } from "./memo-mdx-components";
import type { Locale } from "@/lib/i18n";

const articles = {
  "microsoft-stock-analysis-fiscal-year-2024": MicrosoftArticle,
};

export function MemoArticleContent({ slug, language }: { slug: string; language: Locale }) {
  const Article = articles[slug as keyof typeof articles];
  if (!Article) return null;
  return (
    <div className={appearance["article-body"]} lang={language}>
      <Article components={memoMdxComponents} />
    </div>
  );
}
