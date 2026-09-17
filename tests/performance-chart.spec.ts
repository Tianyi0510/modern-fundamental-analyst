import { expect, test } from "@playwright/test";

test.use({ hasTouch: true });

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  test(`${prefix || "English"} August performance chart and monthly data remain accessible`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`${prefix}/performance`);
    await expect(page.locator('a[href*="docs.google.com/spreadsheets"]')).toHaveCount(0);
    await expect(page.locator(".returns-table")).toHaveCount(0);
    await expect(page.locator(".methodology-explanation > p")).toHaveCount(3);
    const chart = page.locator('figure[aria-labelledby="performance-chart-title"]');
    await expect(chart.getByRole("img")).toBeVisible();
    await expect(chart.getByRole("img")).toHaveAccessibleName(/21\.14%.*21\.00%/);
    await expect(chart.locator("polyline")).toHaveCount(2);
    for (const line of await chart.locator("polyline").all()) {
      expect((await line.getAttribute("points"))!.split(" ")).toHaveLength(20);
      for (const point of (await line.getAttribute("points"))!.split(" ")) {
        const y = Number(point.split(",")[1]);
        expect(y).toBeGreaterThanOrEqual(12);
        expect(y).toBeLessThanOrEqual(288);
      }
    }
    await expect(page.locator(".performance-summary")).toContainText("+21.14%");
    await expect(page.locator(".performance-summary")).toContainText("+21.00%");
    if (!prefix) await expect(page.locator(".page-intro .date-text")).toContainText("As of 31 Aug 2026");
    const summary = chart.locator("summary");
    expect((await summary.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await summary.focus();
    await expect(summary).toHaveCSS("outline-style", "solid");
    await page.keyboard.press("Enter");
    await expect(chart.getByRole("table")).toBeVisible();
    await expect(chart.locator("tbody tr")).toHaveCount(21);
    await expect(chart.locator("tbody tr").first()).toContainText("121,301.99");
    await expect(chart.locator("tbody tr").first()).toContainText("+21.14%");
    const region = chart.getByRole("region");
    expect(await region.evaluate(e => e.scrollWidth > e.clientWidth && e.scrollHeight > e.clientHeight)).toBe(true);
    await region.evaluate(e => { e.scrollLeft = e.scrollWidth; e.scrollTop = e.scrollHeight; });
    expect(await region.evaluate(e => e.scrollLeft > 0 && e.scrollTop > 0)).toBe(true);
    await expect(summary.locator("svg")).toHaveCSS("transition-property", "none");
    await summary.tap();
    await expect(chart.getByRole("table")).not.toBeVisible();
    await summary.tap();
    await expect(chart.getByRole("table")).toBeVisible();
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await expect(summary.locator("svg")).toHaveCSS("transition-property", "transform");
    for (let index = 0; index < 4; index++) await summary.tap();
    await expect(chart.locator("details")).toHaveAttribute("open", "");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.evaluate(() => document.fonts.ready);
    await expect.poll(() => page.locator(".page-intro").evaluate(element => {
      const intro = element.getBoundingClientRect();
      const date = element.querySelector(".date-text")!.getBoundingClientRect();
      return Math.abs(intro.right - date.right);
    }), "Hero date aligns after viewport reflow").toBeLessThan(1);
    for (const width of [320, 801, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate(() => { document.documentElement.style.fontSize = "32px"; });
      await page.evaluate(() => document.fonts.ready);
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth), `Page overflow at ${width}px`).toBeLessThanOrEqual(width);
      await expect(chart.getByRole("img")).toBeVisible();
      await expect(chart.getByRole("img")).toHaveCSS("height", "300px");
    }
  });
}

test("monthly data animates both ways and reverses smoothly", async ({ page }) => {
  for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 844 });
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.goto(`${prefix}/performance`);
      const details = page.locator('figure[aria-labelledby="performance-chart-title"] details');
      const summary = details.locator("summary");
      const collapsed = (await details.boundingBox())!.height;
      await summary.click();
      await expect.poll(() => details.evaluate(e => e.getAnimations().length)).toBe(0);
      const expanded = (await details.boundingBox())!.height;
      expect(expanded).toBeGreaterThan(collapsed + 100);
      const heights = await details.evaluate(element => {
        const summary = element.querySelector("summary")!;
        summary.click();
        const closing = element.getAnimations()[0]!;
        closing.pause();
        closing.currentTime = Number(closing.effect!.getTiming().duration) / 2;
        const before = element.getBoundingClientRect().height;
        summary.click();
        const opening = element.getAnimations()[0]!;
        opening.pause();
        opening.currentTime = 0;
        const after = element.getBoundingClientRect().height;
        opening.play();
        return { before, after };
      });
      expect(heights.before).toBeGreaterThan(collapsed);
      expect(heights.before).toBeLessThan(expanded);
      expect(Math.abs(heights.before - heights.after)).toBeLessThan(1);
      await expect.poll(() => details.evaluate(e => e.getAnimations().length)).toBe(0);
      await summary.focus();
      await page.keyboard.press("Space");
      await expect(details).not.toHaveAttribute("open");
      expect(Math.abs((await details.boundingBox())!.height - collapsed)).toBeLessThan(1);
      await summary.click();
      await page.emulateMedia({ reducedMotion: "reduce" });
      await expect.poll(() => details.evaluate(e => e.getAnimations().length)).toBe(0);
      await summary.click();
      await expect(details).not.toHaveAttribute("open");
    }
  }
});
