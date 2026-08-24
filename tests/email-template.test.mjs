import assert from "node:assert/strict";
import test from "node:test";
import { renderPreferenceEmail } from "../lib/email-template.ts";

test("preference email preserves the brand and escapes interpolated content", () => {
  const html = renderPreferenceEmail({
    heading: "Manage <Preferences>",
    body: "Research & updates",
    action: 'Open "settings"',
    note: "Reader's request",
  }, "https://example.com/preferences?token=a&locale=en");

  assert.match(html, /Modern Fundamental Analyst<span style="color:#008cff">\.<\/span>/);
  assert.match(html, /Manage &lt;Preferences&gt;/);
  assert.match(html, /Research &amp; updates/);
  assert.match(html, /Open &quot;settings&quot;/);
  assert.match(html, /Reader&#39;s request/);
  assert.match(html, /token=a&amp;locale=en/);
  assert.doesNotMatch(html, /Manage <Preferences>/);
});
