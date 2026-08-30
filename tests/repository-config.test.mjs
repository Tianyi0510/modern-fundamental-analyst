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
  const metadata = await read("lib/site-config.ts");

  assert.match(metadata, /canonical/);
  assert.match(metadata, /"zh-Hant-TW"/);
  assert.match(metadata, /"x-default"/);
});
