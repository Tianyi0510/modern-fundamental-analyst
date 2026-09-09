import assert from "node:assert/strict";
import test from "node:test";

import { read } from "./repository-helpers.mjs";

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

test("Next.js applies a conservative security-header baseline", async () => {
  const config = await read("next.config.ts");

  assert.match(config, /poweredByHeader:\s*false/);
  assert.match(config, /Content-Security-Policy/);
  assert.match(config, /form-action 'self' https:\/\/pay\.modernfundamentalanalyst\.com https:\/\/checkout\.stripe\.com/);
  assert.match(config, /frame-ancestors 'none'/);
  assert.match(config, /Permissions-Policy/);
  assert.match(config, /Referrer-Policy/);
  assert.match(config, /X-Content-Type-Options/);
  assert.match(config, /X-Frame-Options/);
});

test("page metadata provides canonical and bilingual alternate URLs", async () => {
  const { createPageMetadata, SITE_NAME } = await import("../lib/site-config.ts");
  const { locales, localeConfig, getLocalizedPath } = await import("../lib/i18n.ts");
  for (const locale of locales) {
    const metadata = createPageMetadata({ title: "About", description: "About research", path: "/about", locale });
    assert.equal(metadata.alternates.canonical, getLocalizedPath("/about", locale));
    for (const target of locales) assert.equal(metadata.alternates.languages[localeConfig[target].hrefLang], getLocalizedPath("/about", target));
    assert.equal(metadata.alternates.languages["x-default"], "/about");
    assert.equal(metadata.openGraph.title, locale === "en" ? `About | ${SITE_NAME}` : `About｜${SITE_NAME}`);
    assert.equal(metadata.twitter.title, metadata.openGraph.title);
    assert.equal(metadata.openGraph.description, metadata.description);
    assert.equal(metadata.twitter.description, metadata.description);
    assert.ok(metadata.openGraph.images.length);
  }
});
