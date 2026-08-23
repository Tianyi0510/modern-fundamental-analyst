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

  assert.match(portfolio, /holdings\.reduce/);
  assert.match(portfolio, /\(marketValue - costBasis\) \/ costBasis/);
  assert.match(portfolio, /holdingsCount: holdings\.length/);
  assert.match(portfolio, /getHoldingReturn/);
  assert.doesNotMatch(portfolio, /returnPct:/);
  assert.doesNotMatch(portfolio, /totalReturn:\s*22\b/);
});

test("portfolio calculations remain internally consistent", async () => {
  const { getHoldingReturn, getPortfolioTotals, portfolioHoldings, portfolioSnapshot } = await import("../data/portfolio.ts");
  const totals = getPortfolioTotals(portfolioHoldings);

  assert.equal(totals.holdingsCount, portfolioHoldings.length);
  assert.equal(totals.costBasis, portfolioSnapshot.costBasis);
  assert.equal(totals.marketValue, portfolioSnapshot.marketValue);
  assert.equal(totals.totalReturn, portfolioSnapshot.totalReturn);

  for (const holding of portfolioHoldings) {
    assert.ok(holding.costBasis > 0, `${holding.symbol} must have a positive cost basis`);
    assert.ok(Number.isFinite(getHoldingReturn(holding)), `${holding.symbol} must have a finite return`);
    assert.ok(Math.abs(holding.shares * holding.price - holding.marketValue) < 0.01, `${holding.symbol} market value must equal shares × price`);
  }
});

test("portfolio dates are formatted from the snapshot date", async () => {
  const [format, home, portfolioPage, performancePage] = await Promise.all([
    read("lib/format.ts"),
    read("components/home-page-content.tsx"),
    read("components/portfolio-page-content.tsx"),
    read("components/performance-page-content.tsx"),
  ]);

  assert.match(format, /formatDate/);
  for (const source of [home, portfolioPage, performancePage]) {
    assert.match(source, /formatDate/);
    assert.doesNotMatch(source, /31 July 2026|2026 年 7 月 31 日/);
  }
});

test("percent formatting handles positive, zero, and negative values", async () => {
  const { formatPercent } = await import("../lib/format.ts");

  assert.equal(formatPercent(3.2), "+3.20%");
  assert.equal(formatPercent(0), "0.00%");
  assert.equal(formatPercent(-3.2), "-3.20%");
});

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

  assert.match(catalog, /microsoft-stock-analysis-fy2024/);
  assert.doesNotMatch(catalog, /durable-pricing-power|self-funded-growth|capital-allocation/);
  assert.match(memoPage, /<details/);
  assert.match(memoPage, /<summary/);
});

test("memo content is selected by slug and locale", async () => {
  const { getMemoContent } = await import("../data/memo-content.ts");

  assert.match(getMemoContent("microsoft-stock-analysis-fy2024", "en").sections[0].title, /Business Analysis/);
  assert.match(getMemoContent("microsoft-stock-analysis-fy2024", "zh-tw").sections[0].title, /企業分析/);
  assert.equal(getMemoContent("missing-memo", "en"), undefined);
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

  assert.match(page, /Detailed investment theses supported by fundamental research, financial analysis, valuation, and clearly defined risks\./);
  assert.match(page, /Last updated on/);
  assert.match(page, /最後更新於/);
  assert.match(page, /最后更新于/);
  assert.match(page, /formatDate\(latestPublishedAt, locale\)/);
  assert.match(page, /className="page-intro"/);
});

test("all home locales use one shared page structure", async () => {
  const [english, traditionalChinese, simplifiedChinese, shared, styles] = await Promise.all([
    read("app/(en)/page.tsx"),
    read("app/zh-tw/page.tsx"),
    read("app/zh-cn/page.tsx"),
    read("components/home-page-content.tsx"),
    read("app/globals.css"),
  ]);

  for (const page of [english, traditionalChinese, simplifiedChinese]) assert.match(page, /HomePageContent/);
  assert.match(shared, /getMemos\(locale\)/);
  assert.match(shared, /className="link-label">\{text\.fullPortfolio\}/);
  assert.match(styles, /\.allocation-card > a:hover \.link-label \{ transform: translateX\(2px\); \}/);
  assert.match(styles, /\.allocation-card > a:hover \.arrow-icon \{ transform: translateX\(4px\); \}/);
});

test("all portfolio and performance locales share page structures", async () => {
  const [portfolioEn, portfolioZhTw, portfolioZhCn, performanceEn, performanceZhTw, performanceZhCn] = await Promise.all([
    read("app/(en)/portfolio/page.tsx"),
    read("app/zh-tw/portfolio/page.tsx"),
    read("app/zh-cn/portfolio/page.tsx"),
    read("app/(en)/performance/page.tsx"),
    read("app/zh-tw/performance/page.tsx"),
    read("app/zh-cn/performance/page.tsx"),
  ]);

  assert.match(portfolioEn, /PortfolioPageContent/);
  assert.match(portfolioZhTw, /PortfolioPageContent/);
  assert.match(portfolioZhCn, /PortfolioPageContent/);
  assert.match(performanceEn, /PerformancePageContent/);
  assert.match(performanceZhTw, /PerformancePageContent/);
  assert.match(performanceZhCn, /PerformancePageContent/);
});

test("all contact and disclaimer locales share page structures", async () => {
  const paths = [
    "app/(en)/contact/page.tsx",
    "app/zh-tw/contact/page.tsx",
    "app/zh-cn/contact/page.tsx",
    "app/(en)/disclaimer/page.tsx",
    "app/zh-tw/disclaimer/page.tsx",
    "app/zh-cn/disclaimer/page.tsx",
  ];
  const pages = await Promise.all(paths.map(read));

  for (const page of pages.slice(0, 3)) assert.match(page, /ContactPageContent/);
  for (const page of pages.slice(3)) assert.match(page, /DisclaimerPageContent/);
});

test("contact form uses a server-only Resend route with localized UI", async () => {
  const [page, form, styles, route, resend] = await Promise.all([
    read("components/contact-page-content.tsx"),
    read("components/contact-form.tsx"),
    read("components/contact-form.module.css"),
    read("app/api/contact/route.ts"),
    read("lib/resend.ts"),
  ]);

  assert.match(page, /ContactForm locale=\{locale\}/);
  assert.match(form, /fetch\("\/api\/contact"/);
  assert.match(form, /"zh-tw"/);
  assert.match(form, /"zh-cn"/);
  assert.match(form, /contact-form\.module\.css/);
  assert.match(styles, /\.form\s*\{[^}]*display:\s*grid/s);
  assert.match(styles, /\.control\s*\{[^}]*border:\s*1px solid var\(--black\)/s);
  assert.match(styles, /\.honeypot\s*\{[^}]*position:\s*absolute !important/s);
  assert.match(route, /CONTACT_TO_EMAIL/);
  assert.match(route, /contact@mail\.modernfundamentalanalyst\.com/);
  assert.match(route, /replyTo:\s*email/);
  assert.match(resend, /process\.env\.RESEND_API_KEY/);
  assert.doesNotMatch(form, /RESEND_API_KEY/);
});

test("subscribe form stores signups in Resend Contacts", async () => {
  const [page, form, styles, route, footer] = await Promise.all([
    read("components/contact-page-content.tsx"),
    read("components/subscribe-form.tsx"),
    read("components/subscribe-form.module.css"),
    read("app/api/subscribe/route.ts"),
    read("components/site-footer.tsx"),
  ]);

  assert.doesNotMatch(page, /SubscribeForm/);
  assert.match(form, /fetch\("\/api\/subscribe"/);
  assert.match(form, /"zh-tw"/);
  assert.match(form, /"zh-cn"/);
  assert.match(styles, /\.section h2\s*\{[^}]*color:\s*var\(--white\)/s);
  assert.match(styles, /\.honeypot\s*\{[^}]*position:\s*absolute !important/s);
  assert.match(route, /resend\.contacts\.create/);
  assert.match(route, /resend\.contacts\.update/);
  assert.match(route, /resend\.contacts\.get/);
  assert.match(route, /unsubscribed:\s*false/);
  assert.doesNotMatch(route, /properties:/);
  assert.match(route, /isSameOrigin/);
  assert.match(route, /isRateLimited/);
  assert.doesNotMatch(form, /RESEND_API_KEY/);
  assert.match(footer, /SubscribeForm locale=\{locale\}/);
});

test("all about locales use one shared page structure", async () => {
  const paths = ["app/(en)/about/page.tsx", "app/zh-tw/about/page.tsx", "app/zh-cn/about/page.tsx"];
  const [english, traditionalChinese, simplifiedChinese, shared] = await Promise.all([...paths.map(read), read("components/about-page-content.tsx")]);

  for (const page of [english, traditionalChinese, simplifiedChinese]) assert.match(page, /AboutPageContent/);
  assert.match(shared, /text\.sections\.map/);
  assert.match(shared, /text\.boundaries\.map/);
});

test("typography uses semantic tokens instead of legacy responsive font clamps", async () => {
  const css = await read("app/globals.css");
  const fontClamp = /font-size:\s*clamp\(/;

  assert.doesNotMatch(css, fontClamp);
  assert.doesNotMatch(css, /--weight-medium/);
  assert.doesNotMatch(css, /font-weight:\s*(?:600|650|670|680|750|800)\b/);
});

test("editorial color roles keep the footer inverse and medium blue auxiliary", async () => {
  const css = await read("app/globals.css");

  assert.match(css, /--surface-primary:\s*var\(--white\)/);
  assert.match(css, /--surface-inverse:\s*var\(--black\)/);
  assert.match(css, /--interactive-accent:\s*var\(--medium-blue\)/);
  assert.match(css, /\.site-footer\s*\{[^}]*background:\s*var\(--surface-inverse\)[^}]*color:\s*var\(--text-inverse\)/s);
  assert.match(css, /\.home-page \.cta\s*\{[^}]*background:\s*var\(--surface-highlight\)[^}]*color:\s*var\(--text-primary\)/s);
  assert.match(css, /\.home-page \.cta \.button-dark\s*\{[^}]*background:\s*var\(--black\)[^}]*color:\s*var\(--white\)/s);
  assert.match(css, /\.portfolio-kpis > div:nth-child\(4\)[^}]*background:\s*var\(--surface-brand\)[^}]*color:\s*var\(--text-highlight\)/s);
});

test("language-specific root layouts preserve html lang without request-time proxying", async () => {
  const [englishLayout, traditionalChineseLayout, simplifiedChineseLayout] = await Promise.all([
    read("app/(en)/layout.tsx"),
    read("app/zh-tw/layout.tsx"),
    read("app/zh-cn/layout.tsx"),
  ]);

  assert.match(englishLayout, /language="en"/);
  assert.match(traditionalChineseLayout, /language="zh-Hant-TW"/);
  assert.match(simplifiedChineseLayout, /language="zh-CN"/);
  await assert.rejects(read("proxy.ts"));
  await assert.rejects(read("app/layout.tsx"));
});

test("all locales provide equivalent navigation paths and SEO alternates", async () => {
  const [{ getLocalizedPath }, sitemap, siteConfig] = await Promise.all([
    import("../lib/i18n.ts"),
    read("app/sitemap.ts"),
    read("lib/site-config.ts"),
  ]);

  assert.equal(getLocalizedPath("/portfolio", "zh-cn"), "/zh-cn/portfolio");
  assert.equal(getLocalizedPath("/zh-tw/memos/example", "zh-cn"), "/zh-cn/memos/example");
  assert.equal(getLocalizedPath("/zh-cn/about", "en"), "/about");
  assert.match(sitemap, /zh-Hans-CN/);
  assert.match(siteConfig, /zh-Hans-CN/);
});
