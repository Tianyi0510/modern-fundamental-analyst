import { describe, expect, it } from "vitest";
import { getMemoCategories, readMemoCategory } from "./memo-categories";
import { getMemos } from "./memos";

describe("article taxonomy", () => {
  it("offers the five approved categories in every locale and excludes monthly reports", () => {
    for (const locale of ["en", "zh-tw", "zh-cn"] as const) {
      const categories = getMemoCategories(locale);
      expect(categories.map(({ id }) => id)).toEqual([
        "company-analysis",
        "industry-analysis",
        "quarterly-report",
        "annual-report",
        "blogs",
      ]);
      expect(new Set(categories.map(({ label }) => label)).size).toBe(5);
      for (const memo of getMemos(locale)) {
        expect(categories).toContainEqual(memo.category);
      }
    }
    expect(getMemos("en")[0]?.category).toEqual({ id: "company-analysis", label: "Company analysis" });
  });
});

it("validates category URL values without accepting inherited object properties", () => {
  for (const value of [null, "", "monthly-report", "toString", "__proto__", "unknown"]) {
    expect(readMemoCategory(value)).toBe("all");
  }
  for (const { id } of getMemoCategories("en")) expect(readMemoCategory(id)).toBe(id);
});
