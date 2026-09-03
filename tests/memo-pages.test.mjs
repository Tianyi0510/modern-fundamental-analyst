import assert from "node:assert/strict";
import test from "node:test";

import { read, readStyles } from "./repository-helpers.mjs";

test("memo metadata uses one localized catalog", async () => {
  const source = await read("data/memos.ts");
  const { memos, memosZhTw, memosZhCn } = await import("../data/memos.ts");

  assert.match(source, /2025-10-10/);
  assert.equal(memos[0].publishedAt, memosZhTw[0].publishedAt);
  assert.equal(memos[0].publishedAt, memosZhCn[0].publishedAt);
  assert.equal(memosZhTw[0].readTime, "閱讀 12 分鐘");
  assert.equal(memosZhCn[0].readTime, "阅读 12 分钟");
});

test("memo catalog contains only the Microsoft source memo and uses one shared disclosure", async () => {
  const [catalog, memoPage] = await Promise.all([
    read("data/memos.ts"),
    read("components/memo-index.tsx"),
  ]);

  assert.match(catalog, /microsoft-stock-analysis-fiscal-year-2024/);
  assert.doesNotMatch(catalog, /durable-pricing-power|self-funded-growth|capital-allocation/);
  assert.match(memoPage, /<details/);
  assert.match(memoPage, /<summary/);
});

test("memo content is selected by slug and locale", async () => {
  const { getMemoContent } = await import("../data/memo-content.ts");

  const english = getMemoContent("microsoft-stock-analysis-fiscal-year-2024", "en");
  const traditionalChinese = getMemoContent("microsoft-stock-analysis-fiscal-year-2024", "zh-tw");

  assert.equal(english.sections[0].title, "Section 1: Business Analysis");
  assert.equal(traditionalChinese.sections[0].title, "Section 1: Business Analysis");
  assert.equal(english.sections[0].subsections[0].paragraphs[0], "Warren Buffett’s most important investing principle is understanding the business in which you’re investing. Buffett once said, “If you don’t understand a business, you shouldn’t own it.”");
  assert.equal(english.referencesTitle, "References:");
  assert.equal(getMemoContent("missing-memo", "en"), undefined);
});

test("memo article uses the source document prose and the wider references layout", async () => {
  const [content, detailPage, styles] = await Promise.all([
    read("content/memos/microsoft-stock-analysis-fiscal-year-2024.ts"),
    read("components/memo-detail-page.tsx"),
    readStyles(),
  ]);

  assert.match(content, /const sourceContent: MemoContent/);
  assert.match(content, /Microsoft now operates through three primary business segments/);
  assert.match(content, /Satya Nadella’s ethical leadership is a masterclass/);
  assert.match(content, /Microsoft‘s retained earnings surged from \$24\.2 billion/);
  assert.doesNotMatch(content, /Business Conclusion|Management Conclusion|Financial Conclusion/);
  assert.match(styles, /\.article-body\s*\{[^}]*width:\s*min\(1040px, 100%\);[^}]*margin-inline:\s*auto/s);
  assert.doesNotMatch(detailPage, /All Investment Memos|back-link/);
  assert.doesNotMatch(styles, /\.back-link(?:-arrow)?/);
  assert.match(styles, /\.memo-references\s*\{[^}]*margin-top:\s*var\(--memo-conclusion-space-after\);[^}]*padding:\s*var\(--space-section-compact\) 48px;[^}]*background:\s*var\(--background-gray\)/s);
  assert.doesNotMatch(styles, /\.memo-references\s*\{[^}]*(?:border-top|border-bottom):/s);
  assert.doesNotMatch(styles, /\.article-source-note\s*\{[^}]*(?:border-top|border-bottom):/s);
});

test("the legacy Microsoft memo URL permanently redirects to the descriptive slug", async () => {
  const config = await read("next.config.ts");
  const detailPage = await read("components/memo-detail-page.tsx");

  assert.match(config, /microsoft-stock-analysis-fy2024/);
  assert.match(config, /microsoft-stock-analysis-fiscal-year-2024/);
  assert.match(config, /permanent:\s*true/);
  assert.match(config, /\["", "\/zh-tw", "\/zh-cn"\]/);
  assert.match(detailPage, /<SiteHeader[^>]+\/>\s*<main className="memo-detail-page"/s);
  assert.match(detailPage, /<\/main>\s*<SiteFooter/s);
});

test("all memo locales use shared list and detail page structures", async () => {
  const paths = [
    "app/(en)/memos/page.tsx",
    "app/zh-tw/memos/page.tsx",
    "app/zh-cn/memos/page.tsx",
    "app/(en)/memos/[slug]/page.tsx",
    "app/zh-tw/memos/[slug]/page.tsx",
    "app/zh-cn/memos/[slug]/page.tsx",
  ];
  const pages = await Promise.all(paths.map(read));

  for (const page of pages.slice(0, 3)) assert.match(page, /MemoListPage/);
  for (const page of pages.slice(3)) {
    assert.match(page, /MemoDetailPage/);
    assert.match(page, /getMemoStaticParams/);
    assert.match(page, /createMemoPageMetadata/);
  }
});

test("memo index hero uses the shared subtitle and latest memo date", async () => {
  const page = await read("components/memo-list-page.tsx");

  assert.match(page, /Detailed investment theses supported by fundamental research, financial analysis, valuation, and clearly defined material risks\./);
  assert.match(page, /Last updated on/);
  assert.match(page, /最後更新於/);
  assert.match(page, /最后更新于/);
  assert.match(page, /formatDate\(latestPublishedAt, locale\)/);
  assert.match(page, /className="page-intro"/);
});

test("desktop and touch memo interactions share restrained color and scale feedback", async () => {
  const [cards, home, index, css] = await Promise.all([
    read("components/memo-cards.tsx"),
    read("components/home-page-content.tsx"),
    read("components/memo-index.tsx"),
    readStyles(),
  ]);

  assert.match(cards, /const slotIndexes = \[0, 1, 2\]/);
  assert.match(cards, /memo-card-placeholder/);
  assert.match(home, /<MemoCards memos=\{memos\}/);
  assert.match(index, /<MemoCards memos=\{memos\}/);
  assert.match(css, /\.metric,\s*\.memo-card,\s*\.performance-summary > div\s*\{[^}]*background:\s*var\(--surface-primary\);[^}]*color:\s*var\(--text-primary\)/s);
  assert.doesNotMatch(css, /\.memo-card\.memo-card-placeholder\s*\{[^}]*surface-inverse/s);
  assert.match(css, /@media \(max-width: 800px\)[\s\S]*?\.memo-card-placeholder\s*\{\s*display:\s*none;/s);
  assert.match(css, /\.memo-card:hover, \.memo-card:focus-visible\s*\{[^}]*color-mix\(in srgb, var\(--bright-blue\) 22%, var\(--white\)\);[^}]*scale\(var\(--motion-scale-press\)\)/s);
  assert.doesNotMatch(css, /\.memo-card:hover, \.memo-card:focus-visible\s*\{[^}]*translateY/);
  assert.match(css, /\.memo-index-row:hover, \.memo-index-row:focus-visible\s*\{[^}]*color-mix\(in srgb, var\(--bright-blue\) 18%, var\(--white\)\);[^}]*scale\(var\(--motion-scale-press\)\)/s);
  assert.match(css, /\.memo-index-row\s*\{[^}]*align-items:\s*start/s);
  assert.doesNotMatch(index, /memo-index-row[\s\S]*?className="arrow-icon"/);
  assert.match(css, /--motion-scale-press:\s*\.98;/);
  for (const selector of [String.raw`\.memo-card`, String.raw`\.memo-index-row`, String.raw`\.memo-disclosure > summary`]) {
    assert.match(css, new RegExp(selector + String.raw`:active\s*\{[^}]*transform:\s*scale\(var\(--motion-scale-press\)\)`, "s"));
  }
  assert.match(css, /@media \(hover: none\) and \(pointer: coarse\)[\s\S]*?\.memo-card:not\(\.memo-card-placeholder\):active\s*\{[^}]*transform:\s*scale\(var\(--motion-scale-press\)\)/s);
  assert.match(css, /@media \(hover: none\) and \(pointer: coarse\)[\s\S]*?\.memo-index-row:active\s*\{[^}]*transform:\s*scale\(var\(--motion-scale-press\)\)/s);
  assert.doesNotMatch(css, /\.memo-disclosure > summary::before/);
  assert.match(css, /\.memo-disclosure > summary:hover, \.memo-disclosure > summary:focus-visible\s*\{[^}]*background:\s*color-mix\(in srgb, var\(--bright-blue\) 18%, var\(--white\)\);[^}]*color:\s*var\(--deep-blue\)/s);
  assert.match(css, /\.memo-disclosure > summary:hover > span:first-child,[^}]*translateX\(8px\)/s);
  assert.match(index, /import \{ ChevronDown \} from "lucide-react"/);
  assert.match(index, /className="memo-summary-meta"[\s\S]*className="memo-count"[\s\S]*<ChevronDown aria-hidden="true" size=\{24\} strokeWidth=\{2\} \/>/);
  assert.match(css, /\.memo-summary-meta \{[^}]*white-space: nowrap/);
  assert.match(css, /\.memo-disclosure > summary svg\s*\{[^}]*transition:\s*transform/);
  assert.match(css, /\.memo-disclosure\[open\] > summary svg\s*\{\s*transform:\s*rotate\(180deg\);/);
  assert.match(css, /\.memo-disclosure > summary:hover,[\s\S]*?\.memo-disclosure > summary:focus-visible\s*\{\s*color:\s*var\(--deep-blue\)/s);
  assert.match(css, /@media \(hover: none\) and \(pointer: coarse\)[\s\S]*?\.memo-disclosure > summary:active\s*\{[^}]*background:\s*color-mix\(in srgb, var\(--bright-blue\) 18%, var\(--white\)\);[^}]*color:\s*var\(--deep-blue\)/s);
  assert.match(css, /@media \(hover: none\) and \(pointer: coarse\)[\s\S]*?\.memo-disclosure > summary:active > span:first-child\s*\{[^}]*transform:\s*none/s);
});
