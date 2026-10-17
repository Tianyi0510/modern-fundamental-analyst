import type { Metadata } from "next";
import { getMemoContent } from "./memo-content";
import { getMemo } from "@/features/memos/memos";
import { getLocalizedPath, localeConfig, type Locale } from "@/lib/i18n";
import { createPageMetadata, SITE_URL } from "@/lib/site-config";
import { getNavigationCopy } from "@/lib/navigation-copy";

export function createMemoPageMetadata(slug: string, locale: Locale): Metadata {
  const memo = getMemo(slug, locale);
  if (!memo) return {};
  const metadata = createPageMetadata({ title: memo.title, description: memo.summary, path: `/memos/${slug}`, locale });
  return { ...metadata, openGraph: { ...metadata.openGraph, type: "article", publishedTime: memo.publishedAt } };
}

export function createMemoStructuredData(slug: string, locale: Locale) {
  const memo = getMemo(slug, locale);
  if (!memo) return null;
  const url = `${SITE_URL}${getLocalizedPath(`/memos/${slug}`, locale)}`;
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: memo.title,
    description: memo.summary,
    datePublished: memo.publishedAt,
    inLanguage: localeConfig[getMemoContent(slug, locale)?.language ?? locale].hrefLang,
    url,
    mainEntityOfPage: url,
  }).replace(/</g, "\\u003c");
}

export function createMemoBreadcrumbStructuredData(slug: string, locale: Locale) {
  const memo = getMemo(slug, locale);
  if (!memo) return null;
  const navigation = getNavigationCopy(locale);
  const items = [
    { name: navigation.home, path: "/" },
    { name: navigation.memos, path: "/memos" },
    { name: memo.title, path: `/memos/${slug}` },
  ];
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(({ name, path }, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name,
      item: `${SITE_URL}${getLocalizedPath(path, locale)}`,
    })),
  }).replace(/</g, "\\u003c");
}
