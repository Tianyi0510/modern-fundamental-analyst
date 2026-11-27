import { expect, test } from "@playwright/test";

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  test(
    `${prefix || "English"} editorial cards retain readable content`,
    { tag: "@mobile" },
    async ({ page }, testInfo) => {
      for (const width of testInfo.project.name === "webkit" ? [390] : [390, 834, 1099, 1100, 1101, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.goto(`${prefix}/about`);
        const panels = page.locator(".about-boundaries > section");
        await expect(panels).toHaveCount(2);
        for (const gutter of ["auto", "stable"]) {
          await page.evaluate((value) => {
            document.documentElement.style.scrollbarGutter = value;
          }, gutter);
          const shell = (await page.locator(".about-closing").boundingBox())!;
          const first = (await panels.first().locator("ol").boundingBox())!;
          const last = (await panels.last().locator("ol").boundingBox())!;
          expect(first.x).toBeCloseTo(shell.x, 1);
          expect(last.x + last.width).toBeCloseTo(shell.x + shell.width, 1);
          if (width >= 1101) {
            expect(first.y).toBeCloseTo(last.y, 0);
            const center = shell.x + shell.width / 2;
            expect(center - first.x - first.width).toBeCloseTo(Math.min(shell.x, 64), 1);
            expect(last.x - center).toBeCloseTo(Math.min(shell.x, 64), 1);
          } else expect(last.y).toBeGreaterThan(first.y + first.height);
        }
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
    },
  );
}
