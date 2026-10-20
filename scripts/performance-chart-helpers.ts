import { expect, type Locator } from "@playwright/test";

export async function showInteractivePerformanceChart(figure: Locator) {
  await figure.locator("[data-chart-viewport]").scrollIntoViewIfNeeded();
  const chart = figure.getByRole("application");
  await chart.scrollIntoViewIfNeeded();
  await expect(chart).toBeVisible();
  await expect(figure.locator(".recharts-line-curve")).toHaveCount(2);
}

export async function showLatestPerformanceTooltip(figure: Locator) {
  const chart = figure.getByRole("application");
  await chart.focus();
  // Move away from a previously selected endpoint before returning to it.
  await chart.press("ArrowLeft");
  for (let index = 0; index < 23; index++) await chart.press("ArrowRight");
  return figure.locator(".recharts-tooltip-wrapper");
}
