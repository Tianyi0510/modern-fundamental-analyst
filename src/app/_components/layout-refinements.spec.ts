import { expect, test } from "@playwright/test";

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  test(`${prefix || "English"} chart axis labels do not intersect`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`${prefix}/performance`);
    const chart = page.locator(".recharts-wrapper").first();
    await expect(chart.locator(".recharts-xAxis-tick-labels text").first()).toBeVisible();
    const baseline = chart.locator(".chart-baseline line");
    await expect(baseline).toHaveCount(1);
    await expect.poll(() => baseline.evaluate((element) => element.getBoundingClientRect().width)).toBeGreaterThan(0);
    await expect(baseline).toHaveAttribute("stroke-width", "1");
    await expect
      .poll(() => baseline.evaluate((element) => element.getAttribute("y1") === element.getAttribute("y2")))
      .toBe(true);
    const intersects = await chart.evaluate((element) => {
      const x = Array.from(element.querySelectorAll(".recharts-xAxis-tick-labels text"));
      const y = Array.from(element.querySelectorAll(".recharts-yAxis-tick-labels text"));
      return x.some((a) =>
        y.some((b) => {
          const r = a.getBoundingClientRect();
          const s = b.getBoundingClientRect();
          return r.left < s.right && r.right > s.left && r.top < s.bottom && r.bottom > s.top;
        }),
      );
    });
    expect(intersects).toBe(false);
    await expect(baseline).toHaveCSS("stroke", "rgb(0, 0, 0)");
    await expect(baseline).toHaveAttribute("stroke-dasharray", "6 4");
    await page.evaluate(() => document.documentElement.setAttribute("data-theme", "dark"));
    await expect(baseline).toHaveCSS("stroke", "rgb(204, 204, 204)");
  });
  test(`${prefix || "English"} memo cards have consistent outer padding`, async ({ page }) => {
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(`${prefix}/memos`);
      const card = page.locator(".memo-card").first();
      const padding = "48px";
      await expect(card.locator('[data-slot="card-header"]')).toHaveCSS("padding-top", padding);
      await expect(card.locator('[data-slot="card-header"]')).toHaveCSS("padding-left", padding);
      await expect(card.locator('[data-slot="card-content"]')).toHaveCSS("padding-left", padding);
      await expect(card.locator('[data-slot="card-footer"]')).toHaveCSS("padding-bottom", padding);
    }
  });
}
