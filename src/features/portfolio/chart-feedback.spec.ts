import { expect, test } from "@playwright/test";
import { showInteractivePerformanceChart } from "../../../scripts/performance-chart-helpers";
import { colorContrast } from "../../../scripts/color-contrast";

for (const colorScheme of ["light", "dark"] as const) {
  test(`${colorScheme} chart tick labels meet normal-text contrast`, async ({ page }) => {
    await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
    await page.goto("/performance");
    const figure = page.locator("main figure").first();
    await showInteractivePerformanceChart(figure);
    const ticks = figure.locator(".recharts-cartesian-axis-tick-value");
    await expect(ticks.first()).toBeVisible();
    const colors = await ticks.evaluateAll((nodes) =>
      nodes.map((node) => {
        let surface: Element | null = node;
        while (surface && ["rgba(0, 0, 0, 0)", "transparent"].includes(getComputedStyle(surface).backgroundColor)) {
          surface = surface.parentElement;
        }
        return {
          text: getComputedStyle(node).fill,
          background: surface ? getComputedStyle(surface).backgroundColor : "rgb(255, 255, 255)",
        };
      }),
    );
    for (const color of colors) expect(colorContrast(color.text, color.background)).toBeGreaterThanOrEqual(4.5);
  });
}

for (const reducedMotion of ["reduce", "no-preference"] as const) {
  test(`expanded disclosure preserves arrow direction during press with ${reducedMotion}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion });
    await page.goto("/performance");
    const trigger = page.locator("main figure").first().locator('[data-slot="collapsible-trigger"]');
    const chevron = trigger.locator("svg.lucide-chevron-down");
    const direction = () => chevron.evaluate((element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).a);
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect.poll(direction).toBeLessThan(-0.9);
    for (let press = 0; press < 2; press++) {
      await trigger.hover();
      await page.mouse.down();
      const scale = await chevron.evaluate((element) =>
        Number(getComputedStyle(element).getPropertyValue("--motion-scale-press")),
      );
      await expect.poll(direction).toBeCloseTo(-scale, 3);
      await page.mouse.move(0, 0);
      await page.mouse.up();
      await expect(trigger).toHaveAttribute("aria-expanded", "true");
    }
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });
}
