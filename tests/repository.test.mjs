import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { registerHooks } from "node:module";
import test from "node:test";

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      return nextResolve(new URL(`../${specifier.slice(2)}.ts`, import.meta.url).href, context);
    }
    return nextResolve(specifier, context);
  },
});

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const styleModules = [
  "app/reset.css",
  "app/styles/base.css",
  "app/styles/chrome.css",
  "app/styles/pages.css",
  "app/styles/typography.css",
  "app/styles/responsive.css",
  "app/styles/colors.css",
];
const readStyles = async () => (await Promise.all(styleModules.map(read))).join("\n");

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
  const [portfolio, calculations] = await Promise.all([
    read("data/portfolio.ts"),
    read("lib/portfolio-calculations.ts"),
  ]);

  assert.match(calculations, /holdings\.reduce/);
  assert.match(calculations, /\(marketValue - costBasis\) \/ costBasis/);
  assert.match(calculations, /holdingsCount: holdings\.length/);
  assert.match(calculations, /getHoldingReturn/);
  assert.match(portfolio, /getPortfolioTotals\(portfolioHoldings\)/);
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

  const english = getMemoContent("microsoft-stock-analysis-fy2024", "en");
  const traditionalChinese = getMemoContent("microsoft-stock-analysis-fy2024", "zh-tw");

  assert.equal(english.sections[0].title, "Section 1: Business Analysis");
  assert.equal(traditionalChinese.sections[0].title, "Section 1: Business Analysis");
  assert.equal(english.sections[0].subsections[0].paragraphs[0], "Warren Buffett’s most important investing principle is understanding the business in which you’re investing. Buffett once said, “If you don’t understand a business, you shouldn’t own it.”");
  assert.equal(english.referencesTitle, "References:");
  assert.equal(getMemoContent("missing-memo", "en"), undefined);
});

test("memo article uses the source document prose and the wider references layout", async () => {
  const [content, styles] = await Promise.all([read("data/memo-content.ts"), readStyles()]);

  assert.match(content, /const sourceContent: MemoContent/);
  assert.match(content, /Microsoft now operates through three primary business segments/);
  assert.match(content, /Satya Nadella’s ethical leadership is a masterclass/);
  assert.match(content, /Microsoft‘s retained earnings surged from \$24\.2 billion/);
  assert.doesNotMatch(content, /Business Conclusion|Management Conclusion|Financial Conclusion/);
  assert.match(styles, /\.article-body\s*\{[^}]*width:\s*min\(1040px, 100%\);[^}]*margin-inline:\s*auto/s);
  assert.match(styles, /\.memo-references\s*\{[^}]*background:\s*var\(--background-gray\)/s);
  assert.doesNotMatch(styles, /\.memo-references\s*\{[^}]*(?:border-top|border-bottom):/s);
  assert.doesNotMatch(styles, /\.article-source-note\s*\{[^}]*(?:border-top|border-bottom):/s);
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
  const [english, traditionalChinese, simplifiedChinese, shared, copy, styles] = await Promise.all([
    read("app/(en)/page.tsx"),
    read("app/zh-tw/page.tsx"),
    read("app/zh-cn/page.tsx"),
    read("components/home-page-content.tsx"),
    read("data/home-copy.ts"),
    readStyles(),
  ]);

  for (const page of [english, traditionalChinese, simplifiedChinese]) assert.match(page, /HomePageContent/);
  assert.match(shared, /getMemos\(locale\)/);
  assert.match(shared, /className="link-label">\{text\.fullPortfolio\}/);
  assert.match(shared, /className="home-portfolio-section"/);
  assert.match(shared, /homeCopy\[locale\]/);
  assert.match(copy, /holdingsAllocation: "Holdings allocation"/);
  assert.match(copy, /holdingsAllocation: "持倉佔比"/);
  assert.match(copy, /holdingsAllocation: "持仓占比"/);
  assert.match(shared, /const allocationGradient = `conic-gradient/);
  assert.match(shared, /className="allocation-legend"/);
  assert.match(styles, /\.home-portfolio-section\s*\{[^}]*background:\s*var\(--background-gray\)/s);
  assert.match(styles, /\.intro\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1\.65fr\) minmax\(220px, \.75fr\);[^}]*column-gap:\s*40px/s);
  assert.doesNotMatch(styles, /\.intro\s*\{[^}]*(?:border-top|border-bottom):/s);
  assert.match(styles, /\.allocation-ring\s*\{[^}]*width:\s*min\(210px, 100%\)/s);
  assert.match(styles, /\.allocation-ring::before\s*\{[^}]*inset:\s*15%/s);
  assert.match(styles, /\.allocation-card > a \{[^}]*justify-content: flex-start; gap: 8px;/);
  assert.match(styles, /\.allocation-card > a:hover \{ color: var\(--interactive-accent\); \}/);
  assert.match(styles, /\.allocation-card > a:hover \.arrow-icon \{ transform: translateX\(4px\); \}/);
});

test("all portfolio and performance locales share page structures", async () => {
  const [portfolioEn, portfolioZhTw, portfolioZhCn, performanceEn, performanceZhTw, performanceZhCn, portfolioShared, performanceShared, styles] = await Promise.all([
    read("app/(en)/portfolio/page.tsx"),
    read("app/zh-tw/portfolio/page.tsx"),
    read("app/zh-cn/portfolio/page.tsx"),
    read("app/(en)/performance/page.tsx"),
    read("app/zh-tw/performance/page.tsx"),
    read("app/zh-cn/performance/page.tsx"),
    read("components/portfolio-page-content.tsx"),
    read("components/performance-page-content.tsx"),
    readStyles(),
  ]);

  assert.match(portfolioEn, /PortfolioPageContent/);
  assert.match(portfolioZhTw, /PortfolioPageContent/);
  assert.match(portfolioZhCn, /PortfolioPageContent/);
  assert.match(performanceEn, /PerformancePageContent/);
  assert.match(performanceZhTw, /PerformancePageContent/);
  assert.match(performanceZhCn, /PerformancePageContent/);
  assert.doesNotMatch(portfolioShared, /portfolio-allocation|Allocation by market value|getHoldingWeight/);
  assert.doesNotMatch(portfolioShared, /portfolio-source-note|Source Sheet:/);
  assert.match(portfolioShared, /className="portfolio-holdings-section"/);
  assert.match(portfolioShared, /aria-labelledby="portfolio-holdings-title"/);
  assert.match(performanceShared, /className="methodology-source"/);
  assert.match(performanceShared, /Prices and market values use closing prices as of \{asOf\}/);
  assert.match(styles, /grid-template-areas:\s*"market return" "cost holdings"/);
  assert.match(styles, /\.portfolio-kpis\s*\{[^}]*min-height:\s*680px/s);
  assert.match(styles, /\.portfolio-kpis\s*\{[^}]*gap:\s*0;[^}]*background:\s*transparent/s);
  assert.match(styles, /\.portfolio-kpis > div\s*\{[^}]*padding:\s*30px;[^}]*display:\s*flex;[^}]*flex-direction:\s*column/s);
  assert.match(styles, /\.portfolio-kpis strong\s*\{\s*margin-top:\s*auto/);
  assert.match(styles, /\.portfolio-kpis small\s*\{[^}]*margin-top:\s*14px;[^}]*opacity:\s*\.62/s);
  assert.match(styles, /@media \(max-width:\s*800px\)[\s\S]*?\.portfolio-page \.portfolio-kpis > div\s*\{[^}]*padding:\s*24px/s);
  assert.match(styles, /\.portfolio-holdings-section\s*\{[^}]*background:\s*var\(--background-gray\)/s);
  assert.match(styles, /\.portfolio-holdings-section \.portfolio-total-row\s*\{[^}]*background:\s*transparent/s);
  assert.match(styles, /\.portfolio-mobile-sort\s*\{\s*display:\s*none;/s);
  assert.match(styles, /@media \(max-width:\s*800px\)[\s\S]*?\.portfolio-mobile-sort\s*\{[^}]*display:\s*grid;/s);
  assert.match(styles, /@media \(max-width:\s*800px\)[\s\S]*?\.portfolio-page \.portfolio-kpis\s*\{[^}]*grid-template-columns:\s*1fr;[^}]*grid-template-areas:\s*"market" "cost" "return" "holdings"/s);
  assert.match(styles, /\.portfolio-mobile-sort\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\);[^}]*gap:\s*8px 12px/s);
  assert.match(styles, /\.portfolio-mobile-sort label\s*\{[^}]*display:\s*contents/s);
  assert.match(styles, /\.portfolio-mobile-sort label > span\s*\{[^}]*grid-column:\s*1 \/ -1/s);
  assert.match(styles, /\.portfolio-mobile-sort select,\s*\.portfolio-mobile-sort button\s*\{[^}]*box-sizing:\s*border-box;[^}]*width:\s*100%;[^}]*height:\s*50px;[^}]*margin:\s*0;/s);
  assert.match(styles, /\.portfolio-mobile-sort button\s*\{[^}]*display:\s*inline-flex;[^}]*justify-content:\s*center/s);
  assert.match(styles, /\.portfolio-table-detailed \.portfolio-row > \[role="cell"\]::before\s*\{[^}]*content:\s*attr\(data-label\)/s);
  assert.match(styles, /\.portfolio-table-detailed \.portfolio-row > span\[role="cell"\]:not\(:first-child\)\s*\{[^}]*text-align:\s*left/s);
  assert.match(styles, /\.portfolio-table-detailed \.portfolio-total-cost\s*\{[^}]*grid-column:\s*1;[^}]*grid-row:\s*2;/s);
  assert.match(styles, /\.portfolio-table-detailed \.portfolio-total-weight\s*\{[^}]*grid-column:\s*2;[^}]*grid-row:\s*3;/s);
  assert.match(styles, /\.portfolio-table-detailed \.portfolio-total-row > \[role="cell"\]:not\(:first-child\)\s*\{[^}]*align-content:\s*start/s);
  assert.doesNotMatch(styles, /--portfolio-mobile-inline/);
  assert.match(performanceShared, /className="methodology shell section-gray"/);
  assert.match(styles, /--background-gray:\s*#f8f9fb/);
  assert.match(styles, /\.section-gray\s*\{[^}]*background:\s*var\(--background-gray\)/s);
  assert.match(styles, /\.hero,[\s\S]*?\.page-hero,[\s\S]*?\.memo-article-header\s*\{[^}]*background:\s*var\(--background-gray\)/s);
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

  const [disclaimer, styles] = await Promise.all([
    read("components/disclaimer-page-content.tsx"),
    readStyles(),
  ]);
  assert.match(disclaimer, /className="legal-hero"/);
  assert.match(disclaimer, /className="legal-body"/);
  assert.match(styles, /\.legal > \.site-header\s*\{[^}]*background:\s*var\(--white\)/s);
  assert.match(styles, /\.legal-hero\s*\{[^}]*background:\s*var\(--background-gray\)/s);
  assert.match(styles, /\.legal-body\s*\{[^}]*background:\s*var\(--white\)/s);
  assert.match(styles, /\.legal p\s*\{[^}]*color:\s*var\(--black\)/s);
  assert.doesNotMatch(styles, /\.legal-content\s*\{[^}]*(?:border-top|border-bottom):/s);
  assert.doesNotMatch(styles, /\.legal-section\s*\{[^}]*(?:border-top|border-bottom):/s);
  assert.match(styles, /@media \(max-width:\s*800px\)[\s\S]*?\.legal-section p\s*\{[^}]*grid-column:\s*1 \/ -1/s);
});

test("contact form keeps localized copy on the server and sends through a client boundary", async () => {
  const [page, form, client, styles, route, resend] = await Promise.all([
    read("components/contact-page-content.tsx"),
    read("components/contact-form.tsx"),
    read("components/contact-form-client.tsx"),
    read("components/contact-form.module.css"),
    read("app/api/contact/route.ts"),
    read("lib/resend.ts"),
  ]);

  assert.match(page, /ContactForm locale=\{locale\}/);
  assert.match(page, /className="contact-grid"/);
  assert.doesNotMatch(form, /"use client"/);
  assert.match(form, /ContactFormClient copy=\{copy\[locale\]\}/);
  assert.match(form, /"zh-tw"/);
  assert.match(form, /"zh-cn"/);
  assert.match(client, /"use client"/);
  assert.match(client, /fetch\("\/api\/contact"/);
  assert.match(client, /contact-form\.module\.css/);
  assert.match(styles, /\.form\s*\{[^}]*display:\s*grid/s);
  assert.match(styles, /\.section\s*\{[^}]*background:\s*var\(--bright-blue\);[^}]*color:\s*var\(--black\)/s);
  assert.match(styles, /\.form\s*\{[^}]*border:\s*0;[^}]*background:\s*transparent/s);
  assert.match(styles, /\.control\s*\{[^}]*border:\s*1px solid var\(--black\)/s);
  assert.match(styles, /\.control\s*\{[^}]*background:\s*var\(--background-gray\)/s);
  assert.match(styles, /\.honeypot\s*\{[^}]*position:\s*absolute !important/s);
  assert.match(route, /CONTACT_TO_EMAIL/);
  assert.match(route, /CONTACT_FROM_EMAIL/);
  assert.match(resend, /contact@mail\.modernfundamentalanalyst\.com/);
  assert.match(route, /replyTo:\s*email/);
  assert.match(resend, /process\.env\.RESEND_API_KEY/);
  assert.doesNotMatch(client, /RESEND_API_KEY/);
});

test("subscribe form stores contacts and triggers a localized welcome automation", async () => {
  const [page, form, client, styles, route, footer] = await Promise.all([
    read("components/contact-page-content.tsx"),
    read("components/subscribe-form.tsx"),
    read("components/subscribe-form-client.tsx"),
    read("components/subscribe-form.module.css"),
    read("app/api/subscribe/route.ts"),
    read("components/site-footer.tsx"),
  ]);

  assert.doesNotMatch(page, /SubscribeForm/);
  assert.doesNotMatch(form, /"use client"/);
  assert.match(form, /SubscribeFormClient copy=\{copy\[locale\]\}/);
  assert.match(form, /"zh-tw"/);
  assert.match(form, /"zh-cn"/);
  assert.match(client, /"use client"/);
  assert.match(client, /fetch\("\/api\/subscribe"/);
  assert.match(styles, /\.section h2\s*\{[^}]*color:\s*var\(--white\)/s);
  assert.match(styles, /\.honeypot\s*\{[^}]*position:\s*absolute !important/s);
  assert.match(route, /resend\.contacts\.create/);
  assert.match(route, /resend\.contacts\.update/);
  assert.match(route, /resend\.contacts\.get/);
  assert.match(route, /unsubscribed:\s*false/);
  assert.match(route, /preferred_language: localeConfig\[locale\]\.label/);
  assert.match(route, /resend\.events\.send/);
  assert.match(route, /event:\s*"subscriber\.created"/);
  assert.match(route, /shouldSendWelcome = !existing\.data \|\| existing\.data\.unsubscribed/);
  assert.match(route, /memo_title:\s*latestMemo\.title/);
  assert.match(route, /memo_summary:\s*latestMemo\.summary/);
  assert.match(route, /memo_url:\s*`\$\{SITE_URL\}\$\{prefix\}\/memos\/\$\{latestMemo\.slug\}`/);
  assert.match(route, /preferences_url: preferencesUrl/);
  assert.doesNotMatch(route, /ok: true, preferencesUrl/);
  assert.match(route, /unsubscribed:\s*true/);
  assert.match(form, /secure preferences link/);
  assert.match(form, /安全偏好設定連結/);
  assert.match(form, /安全偏好设置链接/);
  assert.match(route, /isSameOrigin/);
  assert.match(route, /await isRateLimited\(request\)/);
  assert.doesNotMatch(client, /RESEND_API_KEY/);
  assert.match(footer, /SubscribeForm locale=\{locale\}/);
});

test("subscription preferences use encrypted expiring links and update Resend contacts", async () => {
  const [tokens, route, requestRoute, page, form, requestForm, segments, subscribeRoute, emailTemplate] = await Promise.all([
    read("lib/subscription-preferences.ts"),
    read("app/api/subscription-preferences/route.ts"),
    read("app/api/subscription-preferences/request/route.ts"),
    read("components/subscription-preferences-page.tsx"),
    read("components/subscription-preferences-form.tsx"),
    read("components/subscription-preferences-request-form.tsx"),
    read("lib/resend-segments.ts"),
    read("app/api/subscribe/route.ts"),
    read("lib/email-template.ts"),
  ]);

  assert.match(tokens, /createCipheriv\("aes-256-gcm"/);
  assert.match(tokens, /payload\.expiresAt <= Date\.now\(\)/);
  assert.match(tokens, /process\.env\.SUBSCRIPTION_PREFERENCES_SECRET/);
  assert.match(tokens, /process\.env\.RESEND_API_KEY/);
  assert.match(route, /readPreferenceToken\(token\)/);
  assert.match(route, /preferred_language: localeConfig\[locale\]\.label/);
  assert.match(route, /syncPreferredLanguageSegment\(resend, payload\.email, locale\)/);
  assert.match(route, /syncPreferredLanguageSegment\(resend, payload\.email, previousLocale\)/);
  assert.match(route, /unsubscribed: true/);
  assert.match(route, /await isRateLimited\(request\)/);
  assert.match(page, /maskEmail\(payload\.email\)/);
  assert.match(page, /Save Preferences/);
  assert.doesNotMatch(form, /RESEND_API_KEY/);
  assert.match(requestRoute, /createPreferenceUrl\(email, locale, 30 \* 60 \* 1000\)/);
  assert.match(requestRoute, /resend\.emails\.send/);
  assert.match(requestRoute, /renderPreferenceEmail/);
  assert.match(emailTemplate, /Modern Fundamental Analyst<span style="color:#008cff">\.<\/span>/);
  assert.doesNotMatch(emailTemplate, />MODERN FUNDAMENTAL ANALYST</);
  assert.match(requestRoute, /existing\.error\?\.statusCode !== 404/);
  assert.match(requestRoute, /return NextResponse\.json\(\{ ok: true \}\)/);
  assert.match(requestForm, /subscription-preferences\/request/);
  assert.match(page, /SubscriptionPreferencesRequestForm/);
  assert.match(segments, /PreferredLanguageSegments|preferredLanguageSegments/);
  assert.match(segments, /process\.env\.RESEND_SEGMENT_EN/);
  assert.match(segments, /contacts\.segments\.add/);
  assert.match(segments, /contacts\.segments\.remove/);
  assert.match(subscribeRoute, /segments: \[\{ id: getPreferredLanguageSegmentId\(locale\) \}\]/);
});

test("all about locales use one shared page structure", async () => {
  const paths = ["app/(en)/about/page.tsx", "app/zh-tw/about/page.tsx", "app/zh-cn/about/page.tsx"];
  const [english, traditionalChinese, simplifiedChinese, shared, styles] = await Promise.all([...paths.map(read), read("components/about-page-content.tsx"), readStyles()]);

  for (const page of [english, traditionalChinese, simplifiedChinese]) assert.match(page, /AboutPageContent/);
  assert.match(shared, /text\.sections\.map/);
  assert.match(shared, /index % 2 === 1 \? " section-gray"/);
  assert.match(styles, /\.about-page \.page-intro p,[\s\S]*?\.about-page \.about-copy,[\s\S]*?\.about-page \.about-boundaries > article:last-child ol,[\s\S]*?\.about-page \.about-closing > div\s*\{\s*color:\s*var\(--black\)/);
  assert.match(shared, /text\.boundaries\.map/);
});

test("typography uses semantic tokens instead of legacy responsive font clamps", async () => {
  const css = await readStyles();
  const fontClamp = /font-size:\s*clamp\(/;

  assert.doesNotMatch(css, fontClamp);
  assert.doesNotMatch(css, /--weight-medium/);
  assert.doesNotMatch(css, /font-weight:\s*(?:600|650|670|680|750|800)\b/);
});

test("editorial color roles keep the footer inverse and Medium Blue auxiliary", async () => {
  const css = await readStyles();

  assert.match(css, /--deep-blue:\s*#002991/);
  assert.match(css, /--medium-blue:\s*#008cff/);
  assert.match(css, /--surface-primary:\s*var\(--white\)/);
  assert.match(css, /--surface-inverse:\s*var\(--black\)/);
  assert.match(css, /--surface-brand:\s*var\(--deep-blue\)/);
  assert.match(css, /--interactive-accent:\s*var\(--medium-blue\)/);
  assert.match(css, /\.site-footer\s*\{[^}]*background:\s*var\(--surface-inverse\)[^}]*color:\s*var\(--text-inverse\)/s);
  assert.match(css, /\.home-page \.cta\s*\{[^}]*background:\s*var\(--surface-highlight\)[^}]*color:\s*var\(--text-primary\)/s);
  assert.match(css, /\.home-page \.cta \.button-dark\s*\{[^}]*background:\s*var\(--black\)[^}]*color:\s*var\(--white\)/s);
  assert.match(css, /\.portfolio-page \.portfolio-kpis > div:nth-child\(1\)\s*\{[^}]*background:\s*var\(--surface-primary\);[^}]*color:\s*var\(--text-primary\)/s);
  assert.match(css, /\.portfolio-page \.portfolio-kpis > div:nth-child\(2\)\s*\{[^}]*background:\s*var\(--surface-highlight\);[^}]*color:\s*var\(--text-brand\)/s);
  assert.match(css, /\.portfolio-page \.portfolio-kpis > div:nth-child\(3\)\s*\{[^}]*background:\s*var\(--surface-brand\);[^}]*color:\s*var\(--text-highlight\)/s);
  assert.match(css, /\.portfolio-page \.portfolio-kpis > div:nth-child\(4\)\s*\{[^}]*background:\s*var\(--surface-primary\);[^}]*color:\s*var\(--text-brand\)/s);
  assert.match(css, /\.home-page \.metric-band > \.metric:nth-child\(1\),\s*\.performance-page \.performance-summary > div:nth-child\(1\)\s*\{[^}]*background:\s*var\(--surface-highlight\);[^}]*color:\s*var\(--text-brand\);/s);
  assert.match(css, /\.about-boundaries > article:first-child[^}]*\{[^}]*background:\s*var\(--surface-inverse\);[^}]*color:\s*var\(--text-inverse\);/s);
  assert.match(css, /\.about-boundaries > article:last-child\s*\{[^}]*background:\s*var\(--surface-highlight\);[^}]*color:\s*var\(--text-primary\);/s);
  assert.match(css, /\.home-page \.metric-band > \.metric:nth-child\(2\),\s*\.performance-page \.performance-summary > div:nth-child\(2\)\s*\{[^}]*background:\s*var\(--surface-brand\);[^}]*color:\s*var\(--text-highlight\);/s);
  assert.match(css, /\.home-page \.metric-band > \.metric:nth-child\(3\),\s*\.performance-page \.performance-summary > div:nth-child\(3\)\s*\{[^}]*background:\s*var\(--surface-primary\);[^}]*color:\s*var\(--text-brand\);/s);
  assert.match(css, /\.home-opening\s*\{[^}]*background:\s*var\(--background-gray\)/s);
  assert.match(css, /\.home-opening > \.site-header\s*\{[^}]*background:\s*var\(--white\)/s);
  assert.match(css, /\.memos-home\s*\{[^}]*background:\s*var\(--background-gray\)/s);
  assert.match(css, /\.home-about > div:last-child p\s*\{[^}]*color:\s*var\(--black\)/s);
  assert.match(css, /\.home-about > div:last-child p\s*\{[^}]*font-size:\s*var\(--type-title\)/s);
  assert.match(css, /\.about-page \.page-intro p,[\s\S]*?\.about-page \.about-copy,[\s\S]*?\.about-page \.about-boundaries > article:last-child ol,[\s\S]*?\.about-page \.about-closing > div\s*\{\s*color:\s*var\(--black\)/);
  assert.match(css, /\.performance-home\s*\{[^}]*background:\s*var\(--surface-primary\);[^}]*color:\s*var\(--text-primary\)/s);
  assert.match(css, /\.performance-home \.button-white\s*\{[^}]*background:\s*var\(--black\);[^}]*color:\s*var\(--white\)/s);
  assert.match(css, /\.contact-grid > article:first-child[^}]*\{[^}]*background:\s*var\(--surface-inverse\);[^}]*color:\s*var\(--text-inverse\)/s);
  assert.match(css, /\.contact-grid > article:first-child p\s*\{[^}]*color:\s*var\(--text-inverse\)/s);
  assert.match(css, /\.contact-grid > article:nth-child\(2\)\s*\{[^}]*background:\s*var\(--surface-primary\);[^}]*color:\s*var\(--text-primary\)/s);
  assert.doesNotMatch(css, /\.about-boundaries\s*\{[^}]*min-height:\s*100svh/s);
  assert.match(css, /--space-section:\s*96px/);
  assert.match(css, /--space-section-compact:\s*72px/);
  assert.match(css, /--space-heading-content:\s*56px/);
  assert.match(css, /\.about-boundaries > article\s*\{[^}]*padding:\s*var\(--space-section\) 48px/s);
  assert.doesNotMatch(css, /\.contact-grid\s*\{[^}]*min-height:\s*100svh/s);
  assert.match(css, /\.contact-grid > article\s*\{[^}]*padding:\s*var\(--space-section\) 48px/s);
  assert.match(css, /\.about-boundaries ol\s*\{[^}]*margin:\s*var\(--space-related-content\) 0 0/s);
  assert.match(css, /\.contact-grid p\s*\{[^}]*margin:\s*var\(--space-related-content\) 0 0/s);
  assert.match(css, /\.about-boundaries li\s*\{\s*border-top:\s*0;/s);
  assert.doesNotMatch(css, /\.(?:site-header|home-opening|home-about|page-hero|about-section|about-boundaries|about-closing|portfolio-kpis|portfolio-holdings-heading|methodology|contact-grid|site-footer)\s*\{[^}]*(?:border-top|border-bottom):/s);
  assert.match(css, /\.memo-index\s*\{[^}]*padding:\s*var\(--space-section\) 0/s);
  assert.doesNotMatch(css, /\.performance-summary > div:nth-child\(3\)[^{]*\{[^}]*box-shadow:\s*inset 0 0 0 1px var\(--black\)/s);
});

test("page sections share one responsive vertical rhythm", async () => {
  const css = await readStyles();

  assert.match(css, /--space-section:\s*96px/);
  assert.match(css, /--space-section-compact:\s*72px/);
  assert.match(css, /--space-heading-content:\s*56px/);
  assert.match(css, /--space-related-content:\s*40px/);
  assert.match(css, /@media \(max-width: 800px\)[\s\S]*--space-section:\s*72px;[\s\S]*--space-section-compact:\s*56px;[\s\S]*--space-heading-content:\s*40px;[\s\S]*--space-related-content:\s*32px;/);
  assert.match(css, /\.hero\s*\{[^}]*padding:\s*var\(--space-section\) 0/s);
  assert.match(css, /\.page-hero\s*\{[^}]*padding:\s*var\(--space-section\) 0/s);
  assert.match(css, /\.legal-hero\s*\{[^}]*padding:\s*var\(--space-section\) 0/s);
  assert.match(css, /\.memo-article\s*\{[^}]*padding:\s*var\(--space-section\) 0/s);
  assert.match(css, /\.legal-section\s*\{[^}]*padding:\s*var\(--space-section-compact\) 0/s);
  assert.match(css, /\.memo-section \+ \.memo-section\s*\{[^}]*margin-top:\s*var\(--space-section\);[^}]*padding-top:\s*var\(--space-section-compact\)/s);
  assert.match(css, /\.contact-hero\s*\{[^}]*min-height:\s*0/s);
});

test("mobile navigation uses coordinated motion with a reduced-motion fallback", async () => {
  const [header, css] = await Promise.all([
    read("components/site-header.tsx"),
    readStyles(),
  ]);

  assert.match(header, /aria-modal="true"/);
  assert.match(header, /event\.key === "Escape"/);
  assert.match(css, /\.mobile-menu-drawer\s*\{[^}]*translateX\(calc\(100% \+ 24px\)\)[^}]*\.42s cubic-bezier/s);
  assert.match(css, /\.mobile-menu-drawer nav a::after \{ display: none; \}/);
  assert.match(css, /\.mobile-menu-layer\.is-open \.mobile-menu-top/);
  assert.match(css, /\.mobile-menu-layer\.is-open \.mobile-language-links/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});

test("shared client navigation receives only the active locale copy from server components", async () => {
  const [header, navigationCopy, home, about, portfolio] = await Promise.all([
    read("components/site-header.tsx"),
    read("lib/navigation-copy.ts"),
    read("components/home-page-content.tsx"),
    read("components/about-page-content.tsx"),
    read("components/portfolio-page-content.tsx"),
  ]);

  assert.match(header, /"use client"/);
  assert.match(header, /copy: NavigationCopy/);
  assert.doesNotMatch(header, /Mobile primary navigation|手機版主要導覽|手机版主要导航/);
  assert.match(navigationCopy, /satisfies Record<Locale, NavigationCopy>/);
  for (const component of [home, about, portfolio]) {
    assert.match(component, /SiteHeader copy=\{getNavigationCopy\(locale\)\} locale=\{locale\}/);
  }
});

test("portfolio table receives only the active locale labels from its server parent", async () => {
  const [table, page] = await Promise.all([
    read("components/portfolio-table.tsx"),
    read("components/portfolio-page-content.tsx"),
  ]);

  assert.match(table, /"use client"/);
  assert.match(table, /copy: PortfolioTableCopy/);
  assert.doesNotMatch(table, /投資組合持股|投资组合持仓|"zh-tw"|"zh-cn"/);
  assert.match(page, /satisfies Record<Locale, PortfolioTableCopy>/);
  assert.match(page, /PortfolioTable copy=\{tableCopy\[locale\]\} holdings=\{portfolioHoldings\}/);
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
