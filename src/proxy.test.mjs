import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server.js";
import nextTesting from "next/experimental/testing/server.js";
import { config, proxy } from "./proxy.ts";

// The installed Next.js version retains the Middleware name for its matcher test helper.
const { unstable_doesMiddlewareMatch: matchesProxy } = nextTesting;

test("locale proxy excludes service endpoints and known static resources", () => {
  for (const path of [
    "/api/contact",
    "/_next/static/chunk.js",
    "/_next/image?url=logo.png",
    "/_vercel/insights/script.js",
    "/robots.txt",
    "/sitemap.xml",
    "/favicon.ico",
    "/apple-icon.png?version=1",
    "/icon.svg",
    "/icon.png",
    "/logo.svg",
    "/logo.png",
    "/og-logo.png",
    "/images/logo.png",
  ]) {
    assert.equal(matchesProxy({ config, url: path }), false, path);
  }
});

test("locale proxy still covers localized pages and dotted missing paths", () => {
  for (const [prefix, locale] of [
    ["", "en"],
    ["/zh-tw", "zh-tw"],
    ["/zh-cn", "zh-cn"],
  ]) {
    for (const suffix of ["", "/support?status=error", "/missing.html", "/memos/missing.article"]) {
      const path = `${prefix}${suffix}` || "/";
      assert.equal(matchesProxy({ config, url: path }), true, path);
      const response = proxy(new NextRequest(`https://example.com${path}`, { headers: { "x-site-locale": "forged" } }));
      assert.equal(response.headers.get("x-middleware-request-x-site-locale"), locale, path);
    }
  }
});
