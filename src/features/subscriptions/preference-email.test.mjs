import assert from "node:assert/strict";
import test from "node:test";
import { JSDOM } from "jsdom";
import { colorContrast } from "../../../scripts/color-contrast.ts";
import { renderPreferenceEmail } from "./preference-email.tsx";

test("preference email preserves the brand and escapes interpolated content", async () => {
  const html = await renderPreferenceEmail(
    {
      heading: "Manage <Preferences>",
      body: "Research & updates",
      action: 'Open "settings"',
      note: "Reader's request",
    },
    "https://example.com/preferences?token=a&locale=en",
  );

  assert.match(html, /Modern Fundamental Analyst<span style="color:#7dcbfa">\.<\/span>/);
  assert.match(html, /Manage &lt;Preferences&gt;/);
  assert.match(html, /Research &amp; updates/);
  assert.match(html, /Open &quot;settings&quot;/);
  assert.match(html, /Reader&#x27;s request/);
  assert.match(html, /token=a&amp;locale=en/);
  assert.doesNotMatch(html, /Manage <Preferences>/);
});

for (const [locale, lang] of [
  ["en", "en"],
  ["zh-tw", "zh-Hant-TW"],
  ["zh-cn", "zh-CN"],
]) {
  test(`all three ${locale} previews render localized, escaped HTML and plain text`, async () => {
    const { createElement } = await import("react");
    const { render } = await import("react-email");
    for (const kind of ["contact", "preferences", "confirmation"]) {
      const previewPath =
        kind === "contact" ? `../contact/previews/contact-${locale}.tsx` : `./previews/${kind}-${locale}.tsx`;
      const { default: Preview } = await import(previewPath);
      const element = createElement(Preview);
      const html = await render(element);
      const text = await render(element, { plainText: true });
      assert.match(html, new RegExp(`lang="${lang}"`));
      const document = new JSDOM(html).window.document;
      const palette = new Set([
        "#0d288b",
        "#3d8af7",
        "#7dcbfa",
        "#000000",
        "#ffffff",
        "#cccccc",
        "#eef0f2",
        "#f5f7fa",
        "#007c66",
        "#bf2a2c",
      ]);
      for (const color of html.match(/#[0-9a-f]{6}\b/gi) ?? []) {
        assert.ok(palette.has(color.toLowerCase()), `Unexpected email color ${color}`);
      }
      const inheritedStyle = (element, property) => {
        for (let parent = element; parent; parent = parent.parentElement) {
          if (parent.style[property]) return parent.style[property];
        }
        throw new Error(`Missing explicit ${property}`);
      };
      for (const element of document.querySelectorAll("h1, p, a")) {
        assert.ok(
          colorContrast(inheritedStyle(element, "color"), inheritedStyle(element, "backgroundColor")) >= 4.5,
          `Email text contrast: ${kind} ${locale} ${element.textContent.slice(0, 30)}`,
        );
      }
      assert.equal(document.documentElement.lang, lang);
      assert.equal(document.documentElement.dir, "ltr");
      for (const child of document.body.children) {
        assert.equal(child.getAttribute("lang"), lang);
        assert.equal(child.getAttribute("dir"), "ltr");
      }
      // Clients may discard document-level metadata; content must retain its language.
      document.documentElement.removeAttribute("lang");
      document.body.removeAttribute("lang");
      assert.equal(document.querySelector("h1").closest("[lang]").getAttribute("lang"), lang);
      assert.match(html, /Modern Fundamental Analyst/);
      assert.equal((html.match(/<h1[ >]/g) ?? []).length, 1);
      assert.ok(Buffer.byteLength(html) < 102_000);
      assert.match(text, /Modern Fundamental Analyst/);
      assert.doesNotMatch(text, /<table|<html/);
      if (kind === "contact") assert.match(text, /reader@example.com/);
      else assert.match(text, /token=preview-only/);
    }
  });
}

test("prototype-shaped reader text stays content and cannot supply renderer options", async () => {
  const { renderContactEmail } = await import("../contact/contact-email.tsx");
  const payload = '{"__proto__":{"polluted":"yes"},"constructor":{"prototype":{"polluted":"yes"}}}';
  const options = JSON.parse('{"__proto__":{"plainText":true},"plainText":true,"htmlToTextOptions":{"wordwrap":1}}');
  const contact = await renderContactEmail({
    name: payload,
    email: "reader@example.com",
    subject: payload,
    message: payload,
    locale: "en",
    ...options,
  });
  const preference = await renderPreferenceEmail(
    {
      heading: payload,
      body: payload,
      action: "Open preferences",
      note: payload,
      ...options,
    },
    "https://example.com/preferences",
  );
  for (const html of [contact, preference]) {
    const document = new JSDOM(html).window.document;
    assert.ok(document.querySelector("table"), "reader fields cannot switch HTML rendering to plain text");
    assert.ok(document.body.textContent.includes(payload));
    assert.equal(document.querySelector("script"), null);
  }
  assert.equal(Object.prototype.polluted, undefined);
});
