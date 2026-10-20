import assert from "node:assert/strict";
import test from "node:test";

import nextConfig from "../../../next.config.ts";

test("memo metadata uses one localized catalog", async () => {
  const { memos, memosZhTw, memosZhCn } = await import("./memos.ts");

  assert.equal(memos[0].publishedAt, "2025-10-10");
  assert.equal(memos[0].publishedAt, memosZhTw[0].publishedAt);
  assert.equal(memos[0].publishedAt, memosZhCn[0].publishedAt);
  assert.equal(memosZhTw[0].readTime, "閱讀 12 分鐘");
  assert.equal(memosZhCn[0].readTime, "阅读 12 分钟");
});

test("memo catalog contains only the Microsoft source memo", async () => {
  const { memos } = await import("./memos.ts");

  assert.equal(memos.length, 1);
  assert.equal(memos[0].slug, "microsoft-stock-analysis-fiscal-year-2024");
});

test("memo content is selected by slug and locale", async () => {
  const { getMemoContent } = await import("./memo-content.ts");

  const english = getMemoContent("microsoft-stock-analysis-fiscal-year-2024", "en");
  const traditionalChinese = getMemoContent("microsoft-stock-analysis-fiscal-year-2024", "zh-tw");

  assert.equal(english.language, "en");
  assert.equal(traditionalChinese.language, "en");
  assert.equal(getMemoContent("missing-memo", "en"), undefined);
});

test("the legacy Microsoft memo URL permanently redirects to the descriptive slug", async () => {
  const redirects = await nextConfig.redirects();
  for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
    const source = `${prefix}/memos/microsoft-stock-analysis-fy2024`;
    const matches = redirects.filter((redirect) => redirect.source === source);
    assert.equal(matches.length, 1);
    assert.equal(matches[0].destination, `${prefix}/memos/microsoft-stock-analysis-fiscal-year-2024`);
    assert.equal(matches[0].permanent, true);
  }
});

test("article metadata and structured data agree with the localized catalog", async () => {
  const { createMemoPageMetadata, createMemoStructuredData } = await import("./memo-pages.ts");
  const { getMemo } = await import("./memos.ts");
  const { getLocalizedPath } = await import("@/lib/i18n.ts");
  const slug = "microsoft-stock-analysis-fiscal-year-2024";
  for (const locale of ["en", "zh-tw", "zh-cn"]) {
    const memo = getMemo(slug, locale);
    const metadata = createMemoPageMetadata(slug, locale);
    const serialized = createMemoStructuredData(slug, locale);
    const article = JSON.parse(serialized);
    assert.equal(metadata.openGraph.type, "article");
    assert.equal(metadata.openGraph.publishedTime, memo.publishedAt);
    assert.equal(metadata.alternates.canonical, getLocalizedPath(`/memos/${slug}`, locale));
    assert.equal(article.headline, memo.title);
    assert.equal(article.description, memo.summary);
    assert.equal(article.datePublished, memo.publishedAt);
    assert.equal(article.inLanguage, "en");
    assert.ok(article.url.endsWith(metadata.alternates.canonical));
    assert.equal(article.image, undefined);
    assert.ok(metadata.openGraph.images[0].url.endsWith("/og-logo.png"));
    assert.equal(article.dateModified, undefined);
    assert.equal(serialized.includes("<"), false);
  }
  assert.deepEqual(createMemoPageMetadata("missing", "en"), {});
  assert.equal(createMemoStructuredData("missing", "en"), null);
});

test("structured data escapes script terminators without changing article text", async () => {
  const { getMemo } = await import("./memos.ts");
  const { createMemoStructuredData, createMemoBreadcrumbStructuredData } = await import("./memo-pages.ts");
  const slug = "microsoft-stock-analysis-fiscal-year-2024";
  const memo = getMemo(slug, "en");
  const previous = memo.title;
  try {
    memo.title = "</script><script>unexpected()</script>";
    const serialized = createMemoStructuredData(slug, "en");
    assert.equal(serialized.includes("<"), false);
    assert.equal(JSON.parse(serialized).headline, memo.title);
    const breadcrumb = createMemoBreadcrumbStructuredData(slug, "en");
    assert.equal(breadcrumb.includes("<"), false);
    assert.equal(JSON.parse(breadcrumb).itemListElement[2].name, memo.title);
  } finally {
    memo.title = previous;
  }
});

test("memo breadcrumbs describe the real localized navigation hierarchy", async () => {
  const { createMemoBreadcrumbStructuredData } = await import("./memo-pages.ts");
  const { getMemo } = await import("./memos.ts");
  const { getNavigationCopy } = await import("@/lib/navigation-copy.ts");
  const { getLocalizedPath } = await import("@/lib/i18n.ts");
  const slug = "microsoft-stock-analysis-fiscal-year-2024";
  for (const locale of ["en", "zh-tw", "zh-cn"]) {
    const serialized = createMemoBreadcrumbStructuredData(slug, locale);
    const breadcrumb = JSON.parse(serialized);
    const navigation = getNavigationCopy(locale);
    assert.equal(breadcrumb["@context"], "https://schema.org");
    assert.equal(breadcrumb["@type"], "BreadcrumbList");
    assert.deepEqual(breadcrumb.itemListElement, [
      {
        "@type": "ListItem",
        position: 1,
        name: navigation.home,
        item: `https://www.modernfundamentalanalyst.com${getLocalizedPath("/", locale)}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: navigation.memos,
        item: `https://www.modernfundamentalanalyst.com${getLocalizedPath("/memos", locale)}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: getMemo(slug, locale).title,
        item: `https://www.modernfundamentalanalyst.com${getLocalizedPath(`/memos/${slug}`, locale)}`,
      },
    ]);
    assert.equal(serialized.includes("<"), false);
  }
  assert.equal(createMemoBreadcrumbStructuredData("missing", "en"), null);
});
