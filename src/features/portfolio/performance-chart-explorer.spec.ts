import {
  showInteractivePerformanceChart,
  showLatestPerformanceTooltip,
} from "../../../scripts/performance-chart-helpers";
import { expect, test } from "@playwright/test";

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  for (const width of [390, 1440]) {
    test(
      `${prefix || "English"} chart keeps both series without custom controls at ${width}px`,
      width === 390 ? { tag: "@mobile" } : {},
      async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.goto(`${prefix}/performance`);
        const figures = page.locator("main figure");
        await expect(figures).toHaveCount(2);
        for (const figure of await figures.all()) {
          await showInteractivePerformanceChart(figure);
          await expect(figure.getByRole("button")).toHaveCount(1);
          await expect(figure.locator('[data-slot="collapsible-trigger"]')).toHaveCount(1);
          await expect(figure.locator('[data-slot="chart"]').getByRole("button")).toHaveCount(0);
          const curves = figure.locator(".recharts-line-curve");
          const dashes = await curves.evaluateAll((lines) =>
            lines.map((line) => line.getAttribute("stroke-dasharray")),
          );
          expect(dashes.filter(Boolean)).toHaveLength(1);
          const tooltip = await showLatestPerformanceTooltip(figure);
          await expect(tooltip).toContainText("SPY");
          await expect(tooltip).toContainText(prefix ? "2026年9月30日" : "30 Sep 2026");
          await expect(figure.getByRole("application")).toBeFocused();
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      },
    );
  }
}

test(
  "below-fold charts reserve space and stay mounted after entering the viewport",
  { tag: "@mobile" },
  async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/performance");
    const figure = page.locator("main figure").first();
    const viewport = figure.locator("[data-chart-viewport]");
    await expect(viewport.locator('[data-slot="skeleton"]')).toHaveCSS("height", "300px");
    await expect(figure.getByRole("application")).toHaveCount(0);
    await showInteractivePerformanceChart(figure);
    await page.locator("h1").scrollIntoViewIfNeeded();
    await expect(figure.getByRole("application")).toHaveCount(1);
  },
);
