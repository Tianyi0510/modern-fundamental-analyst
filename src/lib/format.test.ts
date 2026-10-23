import { describe, expect, it, vi } from "vitest";
import { formatDate } from "./format";

it("creates the share formatter only when shares are formatted and reuses it", async () => {
  vi.resetModules();
  const constructor = vi.spyOn(Intl, "NumberFormat");
  try {
    const format = await import("./format");
    expect(format.formatDate("2026-09-30", "en", true)).toBe("30 Sep 2026");
    expect(constructor).not.toHaveBeenCalled();
    expect(format.formatShares(1234.567)).toBe("1,234.57");
    expect(format.formatShares(0)).toBe("0");
    expect(constructor).toHaveBeenCalledExactlyOnceWith("en-US", { maximumFractionDigits: 2 });
  } finally {
    constructor.mockRestore();
  }
});

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
