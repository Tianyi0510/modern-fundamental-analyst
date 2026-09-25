import assert from "node:assert/strict";
import test from "node:test";

import { read } from "./repository-helpers.mjs";

test("memo metadata uses one localized catalog", async () => {
  const { memos, memosZhTw, memosZhCn } = await import("../data/memos.ts");

  assert.equal(memos[0].publishedAt, "2025-10-10");
  assert.equal(memos[0].publishedAt, memosZhTw[0].publishedAt);
  assert.equal(memos[0].publishedAt, memosZhCn[0].publishedAt);
  assert.equal(memosZhTw[0].readTime, "閱讀 12 分鐘");
  assert.equal(memosZhCn[0].readTime, "阅读 12 分钟");
});

test("memo catalog contains only the Microsoft source memo", async () => {
  const { memos } = await import("../data/memos.ts");

  assert.equal(memos.length, 1);
  assert.equal(memos[0].slug, "microsoft-stock-analysis-fiscal-year-2024");
});

test("memo content is selected by slug and locale", async () => {
  const { getMemoContent } = await import("../data/memo-content.ts");

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

test("memo article preserves source document prose", async () => {
  const [content, detailPage] = await Promise.all([
    read("data/memos/microsoft-stock-analysis-fiscal-year-2024.ts"),
    read("components/memo-detail-page.tsx"),
  ]);

  assert.match(content, /const sourceContent: MemoContent/);
  assert.match(content, /Microsoft now operates through three primary business segments/);
  assert.match(content, /Satya Nadella’s ethical leadership is a masterclass/);
  assert.match(content, /Microsoft‘s retained earnings surged from \$24\.2 billion/);
  assert.doesNotMatch(content, /Business Conclusion|Management Conclusion|Financial Conclusion/);
  assert.doesNotMatch(detailPage, /All Investment Memos|back-link/);
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
