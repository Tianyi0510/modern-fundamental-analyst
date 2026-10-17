import { expect, test } from "@playwright/test";

const surfaces = [
  { path: "/", values: ".kpi-value strong, .performance-copy > strong", heading: ".performance-home h2" },
  { path: "/portfolio", values: ".kpi-value strong", heading: "#portfolio-holdings-title" },
  { path: "/performance", values: ".kpi-value strong", heading: ".returns .section-heading h2" },
  { path: "/support", values: ".support-amount-option strong", heading: ".support-section h2" },
];

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  for (const mobile of [false, true]) {
    test(
      `${prefix || "English"} financial values remain subordinate to headings on ${mobile ? "mobile" : "desktop"}`,
      mobile ? { tag: "@mobile" } : {},
      async ({ page }, testInfo) => {
        for (const width of mobile ? [320, 390, 800] : [801, 900, 1440]) {
          await page.setViewportSize({ width, height: 1000 });
          for (const surface of surfaces) {
            await page.goto(`${prefix}${surface.path === "/" ? "" : surface.path}` || "/");
            await page.evaluate(() => document.fonts.ready);
            const values = page.locator(surface.values);
            const originalValues = await values.allTextContents();
            expect(originalValues.length).toBeGreaterThan(0);
            for (const scale of [1, 2]) {
              if (scale === 2) await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
              const heading = await page
                .locator(surface.heading)
                .first()
                .evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize));
              const title = await page
                .locator("h1")
                .evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize));
              for (const value of await values.all()) {
                const size = await value.evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize));
                expect(size).toBe((width <= 800 ? 24 : width <= 1100 ? 32 : 40) * scale);
                expect(size).toBeLessThan(heading);
                expect(size).toBeLessThan(title);
                await expect(value).toHaveCSS("font-variant-numeric", "tabular-nums");
                const geometry = await value.evaluate((element) => {
                  const range = document.createRange();
                  range.selectNodeContents(element);
                  const rects = [...range.getClientRects()].map((rect) => ({
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height,
                  }));
                  return { lines: new Set(rects.map((rect) => Math.round(rect.top))).size, rects };
                });
                expect(
                  geometry.lines,
                  `${prefix}${surface.path} at ${width}px / ${scale}x: ${await value.innerText()} ${JSON.stringify(geometry.rects)}`,
                ).toBe(1);
              }
              await expect(values).toHaveText(originalValues);
              const overflow = await page.locator("body").evaluate((body) =>
                [...body.querySelectorAll("*")]
                  .filter((element) => element.getBoundingClientRect().right > innerWidth + 1)
                  .map((element) => ({ tag: element.tagName, text: element.textContent?.trim().slice(0, 80) }))
                  .slice(-10),
              );
              expect(
                await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
                `${prefix}${surface.path} at ${width}px / ${scale}x: ${JSON.stringify(overflow)}`,
              ).toBe(true);
              if (
                prefix === "" &&
                testInfo.project.name === "chromium" &&
                surface.path === "/" &&
                (width === 390 || width === 1440)
              ) {
                await page
                  .locator(".metric-band")
                  .screenshot({ path: testInfo.outputPath(`kpi-${width}-${scale}x.png`) });
                await page
                  .locator(".performance-home")
                  .screenshot({ path: testInfo.outputPath(`performance-${width}-${scale}x.png`) });
              }
            }
          }
        }
      },
    );
  }
}
