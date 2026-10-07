import { describe, expect, it } from "vitest";
import { escapeHtml } from "./escape-html";

describe("escapeHtml", () => {
  it("escapes markup and quotes before user input is inserted into an email", () => {
    expect(escapeHtml(`<a href="x" title='y'>A&B</a>`)).toBe(
      "&lt;a href=&quot;x&quot; title=&#39;y&#39;&gt;A&amp;B&lt;/a&gt;",
    );
  });

  it.each(["", "Research update 2026", "投資組合報酬"])("preserves plain text %j", (value) => {
    expect(escapeHtml(value)).toBe(value);
  });
});
