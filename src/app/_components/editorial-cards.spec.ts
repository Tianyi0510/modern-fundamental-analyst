import { expect, test } from "@playwright/test";

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  test(`${prefix || "English"} editorial cards retain readable content`, async ({ page }) => {
    for (const width of [390, 834, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(`${prefix}/about`);
      const panels = page.locator(".about-boundaries > section");
      await expect(panels).toHaveCount(2);
      for (const panel of await panels.all()) {
        await expect(panel.getByRole("heading", { level: 2 })).toBeVisible();
        await expect(panel.getByRole("list")).toBeVisible();
        for (const item of await panel.getByRole("listitem").all()) {
          await expect(item).not.toHaveText("");
          await expect(item.locator("svg")).toBeVisible();
          await expect(item.locator("svg").locator("..")).toHaveAttribute("aria-hidden", "true");
        }
      }
      await expect(panels.first()).toHaveCSS("color", "rgb(255, 255, 255)");
      await expect(panels.last()).toHaveCSS("color", "rgb(0, 0, 0)");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  });
}
