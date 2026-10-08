import { expect, test } from "@playwright/test";

test.describe("header interaction QA", () => {
  test.use({ viewport: { width: 1440, height: 1000 } });

  test("holding hover moves text inward", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const row = page.locator(".holding-row").first();
    const positions = () =>
      row.evaluate((element) =>
        Array.from(element.children, (child) => {
          const rect = child.getBoundingClientRect();
          return { x: rect.x, width: rect.width };
        }),
      );
    const before = await positions();
    await row.hover();
    await expect(row).toHaveCSS("padding-left", "14px");
    await expect(row).toHaveCSS("padding-right", "14px");
    expect((await positions())[0]!.x - before[0]!.x).toBeCloseTo(14, 1);
  });
});

test.describe("touch holding feedback", () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });

  test("number spacing stays stable during press and release", { tag: "@mobile" }, async ({ page }) => {
    for (const path of ["/", "/zh-tw", "/zh-cn"]) {
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);
      const row = page.locator(".holding-row").first();
      await row.scrollIntoViewIfNeeded();
      const positions = () =>
        row.evaluate((element) => {
          const number = element.children[0]!.getBoundingClientRect();
          const name = element.children[1]!.getBoundingClientRect();
          return { numberX: number.x, nameX: name.x, gap: name.left - number.right };
        });
      const before = await positions();
      expect(before.gap).toBeGreaterThanOrEqual(16);
      await row.hover();
      await expect(row).toHaveCSS("padding-left", "0px");
      await page.mouse.down();
      try {
        await expect(row).toHaveCSS("padding-left", "14px");
        const pressed = await positions();
        expect(pressed.numberX - before.numberX).toBeCloseTo(14, 1);
        expect(pressed.nameX - before.nameX).toBeCloseTo(14, 1);
        expect(pressed.gap).toBeCloseTo(before.gap, 1);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      } finally {
        await page.mouse.up();
      }
      await expect(row).toHaveCSS("padding-left", "0px");
    }
  });
});
