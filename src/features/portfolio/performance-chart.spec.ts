import {
  showInteractivePerformanceChart,
  showLatestPerformanceTooltip,
} from "../../../scripts/performance-chart-helpers";
import { expect, test } from "@playwright/test";
import { colorContrast } from "../../../scripts/color-contrast";

test.use({ hasTouch: true });

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  test(`${prefix || "English"} September performance chart and monthly data remain accessible`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`${prefix}/performance`);
    await expect(page.locator('a[href*="docs.google.com/spreadsheets"]')).toHaveCount(0);
    await expect(page.locator(".returns-table")).toHaveCount(0);
    await expect(page.locator(".methodology-explanation > p")).toHaveCount(4);
    const methodologyNote = page.getByRole("complementary");
    await expect(methodologyNote).toBeVisible();
    await expect(methodologyNote).toContainText(prefix ? "2026年9月30日" : "30 Sep 2026");
    await expect(methodologyNote).toContainText(
      prefix === "/zh-tw" ? "並非即時報價" : prefix === "/zh-cn" ? "并非实时报价" : "not live quotes",
    );
    const chart = page.locator('figure[aria-labelledby="performance-twr-chart-title"]');
    await showInteractivePerformanceChart(chart);
    await expect(chart.getByRole("application")).toBeVisible();
    await expect(await showLatestPerformanceTooltip(chart)).toContainText("38.27%");
    await expect(await showLatestPerformanceTooltip(chart)).toContainText("32.20%");
    await expect(chart.locator(".recharts-line-curve")).toHaveCount(2);
    const strokes = await chart
      .locator(".recharts-line-curve")
      .evaluateAll((lines) => lines.map((line) => getComputedStyle(line).stroke));
    for (const stroke of strokes) expect(colorContrast(stroke, "rgb(255, 255, 255)")).toBeGreaterThanOrEqual(3);
    for (const line of await chart.locator(".recharts-line-curve").all()) {
      const points = (await line.getAttribute("d"))!.match(/[-\d.]+,[-\d.]+/g)!;
      expect(points).toHaveLength(22);
      for (const point of points) {
        const y = Number(point.split(",")[1]);
        expect(y).toBeGreaterThanOrEqual(0);
        expect(y).toBeLessThanOrEqual(300);
      }
    }
    await expect(page.locator(".performance-summary")).toContainText("+24.43%");
    await expect(page.locator(".performance-summary")).toContainText("+19.26%");
    if (!prefix) await expect(page.locator(".page-intro .date-text")).toContainText("As of 30 Sep 2026");
    const summary = chart.locator("[data-slot=collapsible-trigger]");
    await expect(summary.locator("svg.lucide-chevron-down")).toBeVisible();
    expect((await summary.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await summary.focus();
    await expect(summary).toHaveCSS("outline-style", "solid");
    await page.keyboard.press("Enter");
    await expect(chart.getByRole("table")).toBeVisible();
    await expect(chart.locator("tbody tr")).toHaveCount(22);
    await expect(chart.locator("tbody tr").first()).toContainText("127,533.11");
    await expect(chart.locator("tbody tr").first()).toContainText("+38.27%");
    const region = chart.getByRole("region");
    await expect(chart.locator('[data-slot="table-container"]')).toHaveCount(1);
    await expect(region).toHaveAttribute("data-slot", "table-container");
    await expect(region).toHaveAttribute("tabindex", "0");
    await expect(chart.getByRole("table")).toHaveAttribute("data-slot", "table");
    await expect(chart.locator('thead th[scope="col"]')).toHaveCount(4);
    await expect(chart.locator('tbody th[scope="row"]')).toHaveCount(22);
    await expect(chart.locator("caption")).toHaveAttribute("data-slot", "table-caption");
    await expect(chart.locator("thead th").first()).toHaveCSS("position", "sticky");
    await region.focus();
    await page.keyboard.press("ArrowRight");
    await expect.poll(() => region.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
    expect(await region.evaluate((e) => e.scrollWidth > e.clientWidth && e.scrollHeight > e.clientHeight)).toBe(true);
    await region.evaluate((e) => {
      e.scrollLeft = e.scrollWidth;
      e.scrollTop = e.scrollHeight;
    });
    expect(await region.evaluate((e) => e.scrollLeft > 0 && e.scrollTop > 0)).toBe(true);
    await expect(summary.locator("svg")).toHaveCSS("transition-property", "none");
    await summary.tap();
    await expect(chart.getByRole("table")).not.toBeVisible();
    await summary.tap();
    await expect(chart.getByRole("table")).toBeVisible();
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await expect(summary.locator("svg")).toHaveCSS("transition-property", "transform");
    for (let index = 0; index < 4; index++) await summary.tap();
    await expect(chart.locator("[data-slot=collapsible]")).toHaveAttribute("data-open", "");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.evaluate(() => document.fonts.ready);
    await expect
      .poll(
        () =>
          page.locator(".page-intro").evaluate((element) => {
            const intro = element.getBoundingClientRect();
            const date = element.querySelector(".date-text")!.getBoundingClientRect();
            return Math.abs(intro.right - date.right);
          }),
        "Hero date aligns after viewport reflow",
      )
      .toBeLessThan(1);
    for (const width of [320, 801, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate(() => {
        document.documentElement.style.fontSize = "32px";
      });
      await page.evaluate(() => document.fonts.ready);
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth), `Page overflow at ${width}px`)
        .toBeLessThanOrEqual(width);
      await expect(chart.getByRole("application")).toBeVisible();
      await expect(chart.getByRole("application")).toHaveCSS("height", "300px");
    }
  });
}

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  for (const width of [390, 1440]) {
    test(
      `${prefix || "English"} monthly data animates and reverses at ${width}px`,
      width === 390 ? { tag: "@mobile" } : {},
      async ({ page }) => {
        await page.setViewportSize({ width, height: 844 });
        await page.emulateMedia({ reducedMotion: "no-preference" });
        await page.goto(`${prefix}/performance`);
        const details = page.locator('figure[aria-labelledby="performance-twr-chart-title"] [data-slot=collapsible]');
        const summary = details.locator("[data-slot=collapsible-trigger]");
        // Suspense may replace the SSR node during hydration; sample visibility and height together.
        let collapsed = 0;
        await expect
          .poll(async () => {
            collapsed = (await details.boundingBox())?.height ?? 0;
            return collapsed;
          })
          .toBeGreaterThan(0);
        await summary.click();
        await expect.poll(() => details.evaluate((e) => e.getAnimations({ subtree: true }).length)).toBe(0);
        const expanded = (await details.boundingBox())!.height;
        expect(expanded).toBeGreaterThan(collapsed + 100);
        const panel = details.locator("[data-slot=collapsible-content]");
        await expect(panel).toHaveCSS("transition-property", "height");
        await summary.click();
        await summary.click();
        await expect(summary).toHaveAttribute("aria-expanded", "true");
        await expect.poll(() => panel.evaluate((element) => element.getAnimations().length)).toBe(0);
        await summary.focus();
        await page.keyboard.press("Space");
        await expect(details).not.toHaveAttribute("data-open");
        await expect.poll(async () => Math.abs((await details.boundingBox())!.height - collapsed)).toBeLessThan(1);
        await summary.click();
        await page.emulateMedia({ reducedMotion: "reduce" });
        await expect.poll(() => details.evaluate((e) => e.getAnimations({ subtree: true }).length)).toBe(0);
        await summary.click();
        await expect(details).not.toHaveAttribute("data-open");
      },
    );
  }
}

for (const width of [390, 1440]) {
  test(
    `chart tick labels retain Small Body and grid alignment at ${width}px`,
    width === 390 ? { tag: "@mobile" } : {},
    async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
        await page.goto(`${prefix}/performance`);
        for (const figure of await page.locator("figure").all()) await showInteractivePerformanceChart(figure);
        const charts = page.locator('figure svg[role="application"]');
        await expect(charts).toHaveCount(2);
        for (const scale of [1, 2]) {
          await page.addStyleTag({ content: `html { font-size: ${scale * 100}% !important; }` });
          for (const chart of await charts.all()) {
            // Offscreen sections defer layout; measure each chart after real scrolling.
            await chart.scrollIntoViewIfNeeded();
            await expect(chart).toBeInViewport();
            const ticks = await chart.evaluate((chart) => {
              const svg = chart as SVGSVGElement;
              const labels = [...chart.querySelectorAll(".recharts-cartesian-axis-tick-value")].filter((label) =>
                label.textContent?.endsWith("%"),
              );
              const lines = [...svg.querySelectorAll(".recharts-cartesian-grid-horizontal line")];
              return labels.map((label) => {
                const box = label.getBoundingClientRect();
                const center = Number(label.getAttribute("y"));
                const offset = Math.min(...lines.map((line) => Math.abs(center - Number(line.getAttribute("y1")))));
                const style = getComputedStyle(label);
                return {
                  offset,
                  size: style.fontSize,
                  leading: style.lineHeight,
                  weight: style.fontWeight,
                  height: box.height,
                };
              });
            });
            expect(ticks.length).toBeGreaterThan(1);
            for (const tick of ticks) {
              expect(tick.height).toBeGreaterThan(0);
              expect(tick.size).toBe(`${16 * scale}px`);
              expect(Number.parseFloat(tick.leading)).toBeCloseTo(24 * scale, 1);
              expect(tick.weight).toBe("400");
              // Recharts nudges endpoint labels inward to avoid clipping the text.
              expect(Math.abs(tick.offset), `${prefix} at ${width}px / ${scale}x`).toBeLessThanOrEqual(16 * scale);
            }
          }
        }
      }
    },
  );
}
