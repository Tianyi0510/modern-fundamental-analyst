import assert from "node:assert/strict";
import test from "node:test";

import { read } from "./repository-helpers.mjs";

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
