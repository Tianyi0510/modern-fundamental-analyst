import assert from "node:assert/strict";
import test from "node:test";

import { read } from "../../../scripts/repository-helpers.mjs";

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

  assert.equal(english.sections[0].title, "Section 1: Business Analysis");
  assert.equal(traditionalChinese.sections[0].title, "Section 1: Business Analysis");
  assert.equal(
    english.sections[0].subsections[0].paragraphs[0],
    "Warren Buffett’s most important investing principle is understanding the business in which you’re investing. Buffett once said, “If you don’t understand a business, you shouldn’t own it.”",
  );
  assert.equal(english.referencesTitle, "References:");
  assert.equal(getMemoContent("missing-memo", "en"), undefined);
});

test("memo article preserves verified research prose", async () => {
  const { getMemoContent } = await import("./memo-content.ts");
  const content = getMemoContent("microsoft-stock-analysis-fiscal-year-2024", "en");
  const paragraphs = content.sections
    .flatMap((section) => [
      ...(section.introduction ?? []),
      ...section.subsections.flatMap((subsection) => subsection.paragraphs),
    ])
    .join("\n");
  assert.match(paragraphs, /Microsoft now operates through three primary business segments/);
  assert.match(paragraphs, /Satya Nadella’s ethical leadership is a masterclass/);
  assert.match(paragraphs, /Microsoft‘s retained earnings surged from \$24\.2 billion/);
  const titles = content.sections.flatMap((section) => section.subsections.map((subsection) => subsection.title));
  assert.equal(titles.filter((title) => title === "Investment Conclusion").length, 3);
});

test("the legacy Microsoft memo URL permanently redirects to the descriptive slug", async () => {
  const config = await read("next.config.ts");
  const detailPage = await read("src/app/_components/memo-detail-page.tsx");

  assert.match(config, /microsoft-stock-analysis-fy2024/);
  assert.match(config, /microsoft-stock-analysis-fiscal-year-2024/);
  assert.match(config, /permanent:\s*true/);
  assert.match(config, /\["", "\/zh-tw", "\/zh-cn"\]/);
  assert.match(detailPage, /<SiteHeader[^>]+\/>\s*<main className="memo-detail-page"/s);
  assert.match(detailPage, /<\/main>\s*<PageFooter/s);
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
    assert.ok(article.image.endsWith("/og-logo.png"));
    assert.equal(article.dateModified, undefined);
    assert.equal(serialized.includes("<"), false);
  }
  assert.deepEqual(createMemoPageMetadata("missing", "en"), {});
  assert.equal(createMemoStructuredData("missing", "en"), null);
});

test("structured data escapes script terminators without changing article text", async () => {
  const { getMemo } = await import("./memos.ts");
  const { createMemoStructuredData } = await import("./memo-pages.ts");
  const slug = "microsoft-stock-analysis-fiscal-year-2024";
  const memo = getMemo(slug, "en");
  const previous = memo.title;
  try {
    memo.title = "</script><script>unexpected()</script>";
    const serialized = createMemoStructuredData(slug, "en");
    assert.equal(serialized.includes("<"), false);
    assert.equal(JSON.parse(serialized).headline, memo.title);
  } finally {
    memo.title = previous;
  }
});
