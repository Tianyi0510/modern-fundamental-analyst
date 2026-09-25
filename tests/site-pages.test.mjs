import assert from "node:assert/strict";
import test from "node:test";

import { read } from "./repository-helpers.mjs";

test("all home locales use one shared page structure", async () => {
  const [english, traditionalChinese, simplifiedChinese, shared, copy] = await Promise.all([
    read("app/(en)/page.tsx"),
    read("app/zh-tw/page.tsx"),
    read("app/zh-cn/page.tsx"),
    read("components/home-page-content.tsx"),
    read("data/home-copy.ts"),
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

  const disclaimer = await read("components/disclaimer-page-content.tsx");
  assert.match(disclaimer, /className="legal-hero"/);
  assert.match(disclaimer, /className="legal-body"/);
  assert.match(disclaimer, /className="section-number legal-section-label"/);
  assert.match(disclaimer, /aria-hidden="true">·<\/span>/);
  assert.match(disclaimer, /className="legal-section-copy"/);
  assert.match(disclaimer, /title: "Legal Disclaimer and Important"/);
  assert.match(disclaimer, /titleAccent: "Investment Risk Disclosures"/);
  assert.match(
    disclaimer,
    /Please read these terms carefully before relying on any research, financial information, valuation, or performance data/,
  );
  assert.match(disclaimer, /className="legal-subtitle"/);
  assert.match(disclaimer, /"No Investment Advice",\s*"Research and Education, Not Personalized Financial Advice"/);
  assert.match(disclaimer, /"Investment Risks",\s*"Investment Outcomes and Future Events Remain Uncertain"/);
  assert.match(disclaimer, /"Limitation of Liability",\s*"Content Provided Without Warranties or Guaranteed Results"/);
  assert.doesNotMatch(disclaimer, /legal-section-number|numbered-label/);
});

test("all about locales use one shared page structure", async () => {
  const paths = ["app/(en)/about/page.tsx", "app/zh-tw/about/page.tsx", "app/zh-cn/about/page.tsx"];
  const [english, traditionalChinese, simplifiedChinese, shared] = await Promise.all([
    ...paths.map(read),
    read("components/about-page-content.tsx"),
  ]);

  for (const page of [english, traditionalChinese, simplifiedChinese]) assert.match(page, /AboutPageContent/);
  assert.match(shared, /text\.sections\.map/);
  assert.match(shared, /index % 2 === 1 \? " section-gray"/);
  assert.match(shared, /text\.boundaries\.map/);
  assert.match(shared, /className="about-boundary-number"/);
  assert.doesNotMatch(shared, /about-boundary-item|numbered-label/);
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
  const [{ getLocalizedPath }, { default: sitemap }, { createPageMetadata }] = await Promise.all([
    import("../lib/i18n.ts"),
    import("../app/sitemap.ts"),
    import("../lib/site-config.ts"),
  ]);

  assert.equal(getLocalizedPath("/portfolio", "zh-cn"), "/zh-cn/portfolio");
  assert.equal(getLocalizedPath("/zh-tw/memos/example", "zh-cn"), "/zh-cn/memos/example");
  assert.equal(getLocalizedPath("/zh-cn/about", "en"), "/about");
  const metadata = createPageMetadata({ title: "About", description: "About", path: "/about", locale: "zh-cn" });
  const entries = sitemap();
  const entry = entries.find((item) => item.url.endsWith("/zh-cn/about"));
  assert.equal(new URL(entry.alternates.languages["zh-Hans-CN"]).pathname, metadata.alternates.languages["zh-Hans-CN"]);
  assert.equal(new Set(entries.map((item) => item.url)).size, entries.length);
});
