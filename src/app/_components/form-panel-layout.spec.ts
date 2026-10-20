import { expect, test } from "@playwright/test";

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  test(
    `${prefix || "English"} page form panels fit narrow screens and enlarged text`,
    { tag: "@mobile" },
    async ({ page }, testInfo) => {
      const widths = testInfo.project.name === "webkit" ? [320, 390] : [320, 390, 1440];
      for (const route of ["contact", "support"]) {
        await page.goto(`${prefix}/${route}`);
        for (const width of widths) {
          await page.setViewportSize({ width, height: 900 });
          for (const scale of [1, 2]) {
            await page.evaluate((scale) => {
              document.documentElement.style.fontSize = `${scale * 100}%`;
            }, scale);
            await page.evaluate(() => document.fonts.ready);
            await expect
              .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
              .toBeLessThanOrEqual(width);
            for (const form of await page.locator("main form").all()) {
              const contained = await form.evaluate((form) => {
                const bounds = form.getBoundingClientRect();
                return [
                  ...form.querySelectorAll(
                    'input:not([type="hidden"]):not([name="website"]), textarea, button[type="submit"]',
                  ),
                ].every((control) => {
                  const box = control.getBoundingClientRect();
                  return box.left >= bounds.left - 1 && box.right <= bounds.right + 1;
                });
              });
              expect(contained, `${prefix}/${route}, ${width}px, ${scale}x`).toBe(true);
            }
          }
        }
      }
    },
  );
}
