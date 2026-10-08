import { describe, expect, it } from "vitest";
import { formatDate } from "./format";

describe("formatDate", () => {
  it("uses the same September spelling for server and browser rendering", () => {
    expect(formatDate("2026-09-30", "en", true)).toBe("30 Sep 2026");
    expect(formatDate("2026-09-30", "en")).toBe("30 September 2026");
  });

  it.each(["zh-tw", "zh-cn"] as const)("preserves %s numeric dates in both display modes", (locale) => {
    expect(formatDate("2026-09-30", locale, true)).toBe("2026年9月30日");
    expect(formatDate("2026-09-30", locale)).toBe("2026年9月30日");
  });

  it("preserves leap days and year boundaries without timezone conversion", () => {
    expect(formatDate("2024-02-29", "en", true)).toBe("29 Feb 2024");
    expect(formatDate("2025-12-31", "en")).toBe("31 December 2025");
    expect(formatDate("2026-01-01", "en", true)).toBe("1 Jan 2026");
  });

  it.each(["2025-02-29", "2026-02-30", "2026-13-01", "2026-2-05", "2026-09-30T00:00:00Z"])(
    "rejects an invalid calendar date: %s",
    (value) => {
      expect(() => formatDate(value, "en")).toThrow(RangeError);
    },
  );
});
