import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("SEO routes use the production site URL instead of localhost", async () => {
  const [config, sitemap, robots] = await Promise.all([
    read("lib/site-config.ts"),
    read("app/sitemap.ts"),
    read("app/robots.ts"),
  ]);

  assert.match(config, /https:\/\/www\.modernfundamentalanalyst\.com/);
  assert.doesNotMatch(sitemap, /localhost/);
  assert.doesNotMatch(robots, /localhost/);
  assert.match(sitemap, /SITE_URL/);
  assert.match(robots, /SITE_URL/);
});

test("page metadata provides canonical and bilingual alternate URLs", async () => {
  const metadata = await read("lib/site-config.ts");

  assert.match(metadata, /canonical/);
  assert.match(metadata, /"zh-Hant-TW"/);
  assert.match(metadata, /"x-default"/);
});

test("portfolio totals are derived from holdings", async () => {
  const portfolio = await read("data/portfolio.ts");

  assert.match(portfolio, /portfolioHoldings\.reduce/);
  assert.match(portfolio, /\(marketValue - costBasis\) \/ costBasis/);
  assert.match(portfolio, /holdingsCount: portfolioHoldings\.length/);
  assert.doesNotMatch(portfolio, /totalReturn:\s*22\b/);
});

test("bilingual portfolio and performance routes share page structures", async () => {
  const [portfolioEn, portfolioZh, performanceEn, performanceZh] = await Promise.all([
    read("app/(en)/portfolio/page.tsx"),
    read("app/zh-tw/portfolio/page.tsx"),
    read("app/(en)/performance/page.tsx"),
    read("app/zh-tw/performance/page.tsx"),
  ]);

  assert.match(portfolioEn, /PortfolioPageContent/);
  assert.match(portfolioZh, /PortfolioPageContent/);
  assert.match(performanceEn, /PerformancePageContent/);
  assert.match(performanceZh, /PerformancePageContent/);
});

test("typography uses semantic tokens instead of legacy responsive font clamps", async () => {
  const css = await read("app/globals.css");
  const fontClamp = /font-size:\s*clamp\(/;

  assert.doesNotMatch(css, fontClamp);
  assert.doesNotMatch(css, /font-weight:\s*(?:600|650|670|680|750|800)\b/);
});

test("language-specific root layouts preserve html lang without request-time proxying", async () => {
  const [englishLayout, chineseLayout] = await Promise.all([
    read("app/(en)/layout.tsx"),
    read("app/zh-tw/layout.tsx"),
  ]);

  assert.match(englishLayout, /language="en"/);
  assert.match(chineseLayout, /language="zh-Hant-TW"/);
  await assert.rejects(read("proxy.ts"));
  await assert.rejects(read("app/layout.tsx"));
});
