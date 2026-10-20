import { expect, test } from "@playwright/test";

const surfaces = [
  { path: "/", values: ".kpi-value strong, .performance-value strong", heading: ".performance-home h2" },
  { path: "/portfolio", values: ".kpi-value strong", heading: "#portfolio-holdings-title" },
  { path: "/performance", values: ".kpi-value strong", heading: ".returns .section-heading h2" },
  { path: "/support", values: ".support-amount-option strong", heading: ".support-section h2" },
];

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  for (const mobile of [false, true]) {
    test(
      `${prefix || "English"} financial values retain their assigned scale and complete content on ${mobile ? "mobile" : "desktop"}`,
      mobile ? { tag: "@mobile" } : {},
      async ({ page, browserName }, testInfo) => {
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
              for (const value of await values.all()) {
                const size = await value.evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize));
                const featured = await value.evaluate((element) => element.matches(".performance-value strong"));
                const expected =
                  surface.path === "/support"
                    ? width < 1200
                      ? 51
                      : 67
                    : featured
                      ? width < 800
                        ? 51
                        : width < 1200
                          ? 67
                          : 90
                      : 51;
                expect(size).toBe(expected * scale);
                await expect(value).toHaveCSS("font-weight", "700");
                await expect(value).toHaveCSS("letter-spacing", /^(normal|0px)$/);
                expect(await value.evaluate((element) => parseFloat(getComputedStyle(element).lineHeight))).toBeCloseTo(
                  size * 1.15,
                  1,
                );
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
              for (const region of await page.locator(".financial-value-scroll").all()) {
                const dimensions = await region.evaluate((element) => ({
                  width: element.clientWidth,
                  content: element.scrollWidth,
                }));
                if (dimensions.content > dimensions.width + 1) {
                  await region.focus();
                  await expect(region).toBeFocused();
                  // Mobile WebKit emulates touch input, without native arrow-key overflow scrolling.
                  if (browserName !== "webkit") {
                    await region.press("ArrowRight");
                    await expect.poll(() => region.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
                  }
                  // Verify the entire original number remains available at the scroll endpoint.
                  await region.evaluate((element) => {
                    element.scrollLeft = element.scrollWidth;
                  });
                  await expect
                    .poll(() => region.evaluate((element) => element.scrollLeft + element.clientWidth))
                    .toBeGreaterThanOrEqual(dimensions.content - 1);
                  await region.evaluate((element) => {
                    element.scrollLeft = 0;
                  });
                }
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
