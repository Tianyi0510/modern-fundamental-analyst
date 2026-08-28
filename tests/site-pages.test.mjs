import assert from "node:assert/strict";
import test from "node:test";

import { read, readStyles } from "./repository-helpers.mjs";

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
  assert.match(styles, /\.intro\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1\.65fr\) minmax\(220px, \.75fr\);[^}]*column-gap:\s*var\(--space-7\)/s);
  assert.doesNotMatch(styles, /\.intro\s*\{[^}]*(?:border-top|border-bottom):/s);
  assert.match(styles, /\.allocation-ring\s*\{[^}]*width:\s*min\(210px, 100%\)/s);
  assert.match(styles, /\.allocation-ring::before\s*\{[^}]*inset:\s*15%/s);
  assert.match(styles, /\.allocation-card > a \{[^}]*justify-content: flex-start; gap: var\(--space-2\);/);
  assert.match(styles, /\.allocation-card > a:hover, \.allocation-card > a:focus-visible \{ color: var\(--deep-blue\); \}/);
  assert.match(styles, /\.allocation-card > a:hover \.arrow-icon, \.allocation-card > a:focus-visible \.arrow-icon \{ transform: translateX\(4px\); \}/);
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
  assert.match(disclaimer, /className="legal-section-number"/);
  assert.doesNotMatch(disclaimer, />·<|numbered-label/);
  assert.match(styles, /\.legal > \.site-header\s*\{[^}]*background:\s*var\(--white\)/s);
  assert.match(styles, /\.legal-hero\s*\{[^}]*background:\s*var\(--background-gray\)/s);
  assert.match(styles, /\.legal \.legal-hero \.eyebrow,[\s\S]*?font-size:\s*var\(--type-label\);[\s\S]*?font-weight:\s*var\(--weight-bold\)/s);
  assert.match(styles, /\.legal-body\s*\{[^}]*background:\s*var\(--white\)/s);
  assert.match(styles, /\.legal p\s*\{[^}]*color:\s*var\(--black\)/s);
  assert.doesNotMatch(styles, /\.legal-content\s*\{[^}]*(?:border-top|border-bottom):/s);
  assert.doesNotMatch(styles, /\.legal-section\s*\{[^}]*(?:border-top|border-bottom):/s);
  assert.match(styles, /\.legal-section\s*\{[^}]*grid-template-columns:\s*64px minmax\(220px, \.8fr\) minmax\(0, 1\.2fr\);[^}]*gap:\s*var\(--space-8\);[^}]*align-items:\s*start/s);
  assert.match(styles, /\.legal-section-number\s*\{[^}]*font-size:\s*var\(--type-headline\);[^}]*line-height:\s*var\(--leading-heading\);[^}]*font-weight:\s*var\(--weight-bold\);[^}]*text-align:\s*right/s);
  assert.match(styles, /@media \(max-width:\s*800px\)[\s\S]*?\.legal-section\s*\{[^}]*grid-template-columns:\s*40px minmax\(0, 1fr\)/s);
  assert.match(styles, /@media \(max-width:\s*800px\)[\s\S]*?\.legal-section p\s*\{[^}]*grid-column:\s*1 \/ -1/s);
});

test("all about locales use one shared page structure", async () => {
  const paths = ["app/(en)/about/page.tsx", "app/zh-tw/about/page.tsx", "app/zh-cn/about/page.tsx"];
  const [english, traditionalChinese, simplifiedChinese, shared, styles] = await Promise.all([...paths.map(read), read("components/about-page-content.tsx"), readStyles()]);

  for (const page of [english, traditionalChinese, simplifiedChinese]) assert.match(page, /AboutPageContent/);
  assert.match(shared, /text\.sections\.map/);
  assert.match(shared, /index % 2 === 1 \? " section-gray"/);
  assert.match(styles, /\.about-page \.page-intro p,[\s\S]*?\.about-page \.about-copy,[\s\S]*?\.about-page \.about-boundaries > article:last-child ol,[\s\S]*?\.about-page \.about-closing > div\s*\{\s*color:\s*var\(--black\)/);
  assert.match(shared, /text\.boundaries\.map/);
  assert.match(shared, /className="about-boundary-number"/);
  assert.doesNotMatch(shared, /about-boundary-item|numbered-label/);
  assert.match(styles, /\.about-boundaries li\s*\{[^}]*grid-template-columns:\s*42px minmax\(0, 1fr\);[^}]*align-items:\s*baseline/s);
  assert.match(styles, /\.about-boundary-number\s*\{[^}]*font-size:\s*var\(--type-body-large\);[^}]*line-height:\s*var\(--leading-body\);[^}]*font-weight:\s*var\(--weight-bold\)/s);
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
