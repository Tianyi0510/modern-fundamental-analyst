import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("semantic typography class composition", () => {
  it("keeps type treatments separate from text colors and alignment", () => {
    expect(cn("text-control text-white", "text-center text-brand").split(" ").sort()).toEqual([
      "text-brand",
      "text-center",
      "text-control",
    ]);
    expect(cn("text-caption text-[var(--text-secondary)]")).toBe("text-caption text-[var(--text-secondary)]");
  });

  it("replaces a type treatment without removing its color or responsive variant", () => {
    expect(cn("text-display text-brand compact:text-title", "text-headline")).toBe(
      "text-brand compact:text-title text-headline",
    );
    expect(cn("text-[length:var(--font-size-body)]", "text-body-large")).toBe("text-body-large");
  });
  it("merges Material 3 roles without removing colors", () => {
    expect(cn("text-m3-display-large text-brand", "text-m3-body-medium")).toBe("text-brand text-m3-body-medium");
    expect(cn("text-body text-white", "text-m3-label-small")).toBe("text-white text-m3-label-small");
  });
});
