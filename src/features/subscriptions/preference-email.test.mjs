import assert from "node:assert/strict";
import test from "node:test";
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

  assert.match(html, /Modern Fundamental Analyst<span style="color:#008cff">\.<\/span>/);
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
  test(`both ${locale} previews render localized, escaped HTML and plain text`, async () => {
    const { createElement } = await import("react");
    const { render } = await import("react-email");
    for (const kind of ["contact", "preferences"]) {
      const { default: Preview } = await import(`../../../emails/${kind}-${locale}.tsx`);
      const element = createElement(Preview);
      const html = await render(element);
      const text = await render(element, { plainText: true });
      assert.match(html, new RegExp(`lang="${lang}"`));
      assert.match(html, /Modern Fundamental Analyst/);
      assert.equal((html.match(/<h1[ >]/g) ?? []).length, 1);
      assert.ok(Buffer.byteLength(html) < 102_000);
      assert.match(text, /Modern Fundamental Analyst/);
      assert.doesNotMatch(text, /<table|<html/);
      if (kind === "preferences") assert.match(text, /token=preview-only/);
      else assert.match(text, /reader@example.com/);
    }
  });
}
