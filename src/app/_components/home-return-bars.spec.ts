import { test, expect } from "@playwright/test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { HomeReturnBars } from "./home-return-bars";

for (const width of [1440, 834, 390, 320]) {
  test(`home return bars preserve sign, scale and readable labels at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const chart = page.locator(".performance-bars");
    for (const values of [
      [1, 4],
      [0, -2],
      [1, -4],
      [0, 0],
    ]) {
      const html = renderToStaticMarkup(
        createElement(HomeReturnBars, {
          label: "Annualized XIRR",
          series: [
            { name: "Portfolio", value: values[0]! },
            { name: "SPY", value: values[1]! },
          ],
        }),
      );
      await chart.evaluate((element, markup) => {
        element.outerHTML = markup;
      }, html);
      const zero = (await chart.locator(".return-zero").boundingBox())!.y;
      const bounds = (await chart.boundingBox())!;
      const bars = await chart.locator(".bar-value").evaluateAll((elements) =>
        elements.map((el) => {
          const bar = el.getBoundingClientRect();
          const range = document.createRange();
          range.selectNodeContents(el.querySelector("span")!.lastChild!);
          const text = range.getBoundingClientRect();
          return {
            top: bar.top,
            bottom: bar.bottom,
            height: bar.height,
            left: text.left,
            right: text.right,
            labelTop: text.top,
            labelBottom: text.bottom,
          };
        }),
      );
      for (const [i, bar] of bars.entries()) {
        const value = values[i]!;
        expect(value > 0 ? bar.bottom : bar.top).toBeCloseTo(zero, 1);
        if (value === 0) expect(bar.height).toBe(0);
        else expect(bar.height).toBeGreaterThan(0);
        if (value < 0) expect(bar.labelTop).toBeGreaterThanOrEqual(bar.bottom);
        else expect(bar.labelBottom).toBeLessThanOrEqual(bar.top);
        expect(bar.left).toBeGreaterThanOrEqual(bounds.x);
        expect(bar.right).toBeLessThanOrEqual(bounds.x + bounds.width);
        expect(bar.labelTop).toBeGreaterThanOrEqual(bounds.y);
        expect(bar.labelBottom).toBeLessThanOrEqual((await chart.locator("small").first().boundingBox())!.y);
      }
      expect(bars[0]!.right).toBeLessThan(bars[1]!.left);
      if (values[0] === 1) expect(bars[1]!.height / bars[0]!.height).toBeCloseTo(4, 2);
    }
  });
}
