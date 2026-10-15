import assert from "node:assert/strict";
import test from "node:test";

import sitemap from "@/app/sitemap.ts";
import robots from "@/app/robots.ts";
import { SITE_URL } from "./site-config.ts";

test("SEO routes emit unique production URLs and localized alternates", () => {
  assert.equal(SITE_URL, "https://www.modernfundamentalanalyst.com");
  const entries = sitemap();
  assert.ok(entries.length > 0);
  assert.equal(new Set(entries.map(({ url }) => url)).size, entries.length);
  for (const entry of entries) {
    assert.equal(new URL(entry.url).origin, SITE_URL);
    const languages = entry.alternates.languages;
    assert.equal(new URL(languages["x-default"]).origin, SITE_URL);
    for (const language of ["en", "zh-Hant-TW", "zh-Hans-CN"]) {
      assert.equal(new URL(languages[language]).origin, SITE_URL);
      assert.ok(entries.some(({ url }) => url === languages[language]));
    }
  }
  assert.deepEqual(robots(), { rules: { userAgent: "*", allow: "/" }, sitemap: `${SITE_URL}/sitemap.xml` });
});

test("page metadata provides canonical and bilingual alternate URLs", async () => {
  const { createPageMetadata, createRootMetadata, SITE_NAME } = await import("./site-config.ts");
  const { locales, localeConfig, getLocalizedPath } = await import("./i18n.ts");
  for (const locale of locales) {
    const root = createRootMetadata(locale);
    const rootTitle = locale === "en" ? SITE_NAME : `${SITE_NAME}｜${localeConfig[locale].label}`;
    assert.deepEqual(
      root.title,
      locale === "en" ? { default: rootTitle, template: `%s | ${SITE_NAME}` } : { absolute: rootTitle },
    );
    assert.equal(root.alternates.canonical, getLocalizedPath("/", locale));
    assert.equal(root.openGraph.title, rootTitle);
    assert.equal(root.openGraph.url, getLocalizedPath("/", locale));
    assert.equal(root.openGraph.siteName, SITE_NAME);
    assert.equal(root.openGraph.type, "website");
    const ogLocales = { en: "en_US", "zh-tw": "zh_TW", "zh-cn": "zh_CN" };
    assert.equal(root.openGraph.locale, ogLocales[locale]);
    assert.deepEqual(
      root.openGraph.alternateLocale,
      locales.filter((target) => target !== locale).map((target) => ogLocales[target]),
    );
    assert.equal(root.twitter.title, rootTitle);
    const metadata = createPageMetadata({ title: "About", description: "About research", path: "/about", locale });
    assert.equal(metadata.alternates.canonical, getLocalizedPath("/about", locale));
    for (const target of locales)
      assert.equal(metadata.alternates.languages[localeConfig[target].hrefLang], getLocalizedPath("/about", target));
    assert.equal(metadata.alternates.languages["x-default"], "/about");
    assert.equal(metadata.openGraph.title, locale === "en" ? `About | ${SITE_NAME}` : `About｜${SITE_NAME}`);
    assert.equal(metadata.twitter.title, metadata.openGraph.title);
    assert.equal(metadata.openGraph.url, metadata.alternates.canonical);
    assert.equal(metadata.openGraph.siteName, SITE_NAME);
    assert.equal(metadata.openGraph.type, "website");
    assert.equal(metadata.openGraph.locale, ogLocales[locale]);
    assert.equal(metadata.openGraph.description, metadata.description);
    assert.equal(metadata.twitter.description, metadata.description);
    assert.ok(metadata.openGraph.images.length);
  }
});

test("home structured data identifies one canonical website across languages", async () => {
  const { createWebsiteStructuredData, SITE_NAME } = await import("./site-config.ts");
  const serialized = createWebsiteStructuredData();
  const website = JSON.parse(serialized);
  assert.equal(website["@context"], "https://schema.org");
  assert.equal(website["@type"], "WebSite");
  assert.equal(website.name, SITE_NAME);
  assert.equal(website.url, `${SITE_URL}/`);
  assert.equal(website["@id"], `${SITE_URL}/#website`);
  assert.equal(website.potentialAction, undefined);
  assert.equal(serialized.includes("<"), false);
});

test("sitemap excludes private workflows and does not invent modification dates", () => {
  for (const entry of sitemap()) {
    assert.doesNotMatch(entry.url, /subscription-preferences|subscription-confirmation|\/api\/|\?/);
    assert.equal(entry.lastModified, undefined);
    for (const alternate of Object.values(entry.alternates.languages)) {
      const target = sitemap().find(({ url }) => url === alternate);
      assert.deepEqual(target.alternates.languages, entry.alternates.languages);
    }
  }
});
