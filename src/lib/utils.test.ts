import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("semantic typography class composition", () => {
  it("keeps type treatments separate from text colors and alignment", () => {
    expect(cn("text-medium-label text-white", "text-center text-brand").split(" ").sort()).toEqual([
      "text-brand",
      "text-center",
      "text-medium-label",
    ]);
    expect(cn("text-small-body text-[var(--text-secondary)]")).toBe("text-small-body text-[var(--text-secondary)]");
  });

  it("replaces a type treatment without removing its color or responsive variant", () => {
    expect(cn("text-large-headline text-brand compact:text-medium-title", "text-small-headline")).toBe(
      "text-brand compact:text-medium-title text-small-headline",
    );
    expect(cn("text-[length:var(--font-size-small-body)]", "text-medium-body")).toBe("text-medium-body");
    expect(cn("text-small-body text-brand", "font-bold")).toBe("text-small-body text-brand font-bold");
    expect(cn("text-medium-body text-ink", "font-bold")).toBe("text-medium-body text-ink font-bold");
    expect(cn("text-large-headline text-brand", "text-large-display")).toBe("text-brand text-large-display");
    expect(cn("text-large-body text-ink", "text-large-body")).toBe("text-ink text-large-body");
    expect(cn("text-medium-title text-ink", "text-large-title")).toBe("text-ink text-large-title");
  });
});
