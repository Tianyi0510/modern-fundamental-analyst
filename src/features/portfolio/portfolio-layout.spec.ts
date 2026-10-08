import { expect, test } from "@playwright/test";

test("allocation chart and legend fit the card around responsive boundaries", async ({ page }) => {
  for (const width of [390, 801, 1100, 1101, 1151, 1280, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/zh-tw");
    const geometry = await page.locator(".allocation-card").evaluate((card) => {
      const visual = card.querySelector(".allocation-visual")!;
      const bounds = card.getBoundingClientRect();
      return {
        overflow: visual.scrollWidth - visual.clientWidth,
        contained: [...card.querySelectorAll(".allocation-ring, .allocation-legend")].every((child) => {
          const rect = child.getBoundingClientRect();
          return rect.left >= bounds.left && rect.right <= bounds.right;
        }),
      };
    });
    expect(geometry.overflow, `chart at ${width}px`).toBeLessThanOrEqual(1);
    expect(geometry.contained, `card at ${width}px`).toBe(true);
  }
});

test.describe("mobile content and navigation QA", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    hasTouch: true,
    isMobile: true,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1",
  });

  test(
    "performance methodology has compact hierarchy and a top-rule source card",
    { tag: "@mobile" },
    async ({ page }) => {
      await page.goto("/performance");
      const headingBox = await page.locator(".methodology h2").boundingBox();
      const contentBox = await page.locator(".methodology-content").boundingBox();
      expect(headingBox).not.toBeNull();
      expect(contentBox).not.toBeNull();
      expect(contentBox!.y - (headingBox!.y + headingBox!.height)).toBeLessThanOrEqual(40);

      const sourceStyle = await page.locator(".methodology-source").evaluate((element) => {
        const style = getComputedStyle(element);
        return {
          borderTopWidth: style.borderTopWidth,
          borderLeftWidth: style.borderLeftWidth,
          marginTop: style.marginTop,
        };
      });
      expect(sourceStyle).toEqual({ borderTopWidth: "4px", borderLeftWidth: "0px", marginTop: "0px" });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    },
  );
});
