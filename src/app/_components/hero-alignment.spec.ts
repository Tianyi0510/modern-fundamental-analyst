import { expect, test } from "@playwright/test";

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  test(`${prefix || "English"} Hero metadata aligns right and KPI blocks have equal dimensions`, async ({ page }) => {
    for (const width of [390, 768, 834, 1024, 1180, 1280, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const route of ["/", "/about", "/portfolio", "/performance", "/memos"]) {
        await page.goto(`${prefix}${route === "/" ? "" : route}` || "/");
        await page.evaluate(() => document.fonts.ready);
        for (const meta of await page.locator(".page-intro > small").all()) {
          const alignment = await meta.evaluate((node) => ({
            right: node.getBoundingClientRect().right,
            parentRight: node.parentElement!.getBoundingClientRect().right,
          }));
          expect(alignment.right).toBeCloseTo(alignment.parentRight, 0);
          await expect(meta).toHaveCSS("text-align", "right");
        }
        const cells = page.locator(".metric-band > *, .portfolio-kpis > *, .performance-summary > *");
        if (await cells.count()) {
          await expect(cells).toHaveCount(3);
          for (const value of await cells.locator(".kpi-value strong").all()) {
            await expect(value).toHaveCSS("font-size", "51px");
            const fits = await value.locator("..").evaluate((node) => node.scrollWidth <= node.clientWidth + 1);
            expect(fits, `${prefix}${route} at ${width}px: KPI numbers remain fully visible without scrolling`).toBe(
              true,
            );
          }
          const boxes = await cells.evaluateAll((nodes) =>
            nodes.map((node) => {
              const { width, height } = node.getBoundingClientRect();
              return { width, height };
            }),
          );
          if (width >= 768 && width <= 1180) {
            expect(boxes[0]!.height).toBeLessThanOrEqual(160);
            for (const cell of await cells.all()) {
              const label = (await cell.locator("dt").boundingBox())!;
              const number = (await cell.locator(".kpi-value").boundingBox())!;
              expect(number.x).toBeGreaterThan(label.x + label.width);
            }
          }
          for (const box of boxes) {
            expect(box.width).toBeCloseTo(boxes[0]!.width, 0);
            expect(box.height).toBeCloseTo(boxes[0]!.height, 0);
          }
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      }
    }
  });
}

for (const [prefix, hint] of [
  ["", "Scroll to View Full Value"],
  ["/zh-tw", "左右滑動查看完整數值"],
  ["/zh-cn", "左右滑动查看完整数值"],
]) {
  test(`${prefix || "English"} narrow KPI overflow has a visible keyboard-accessible hint`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto(`${prefix}/portfolio`);
    const card = page.locator(".portfolio-kpis > *").first();
    const region = card.getByRole("region");
    await expect(card.getByText(hint!, { exact: true })).toBeVisible();
    await expect(region).toHaveAccessibleDescription(hint!);
    await region.focus();
    await region.press("ArrowRight");
    await expect.poll(() => region.evaluate((node) => node.scrollLeft)).toBeGreaterThan(0);
    await region.evaluate((node) => {
      node.scrollLeft = node.scrollWidth;
    });
    expect(await region.evaluate((node) => node.scrollLeft + node.clientWidth >= node.scrollWidth - 1)).toBe(true);
    await expect(card.locator("strong")).toHaveText("$127,533.11");
    await page.setViewportSize({ width: 390, height: 900 });
    await expect(card.locator(".financial-scroll-hint")).toHaveCount(0);
    await expect(region).not.toHaveAttribute("tabindex");
  });
}

test("Disclaimer Hero keeps a 48px title-to-description gap", async ({ page }) => {
  for (const prefix of ["", "/zh-tw", "/zh-cn"])
    for (const width of [390, 834, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(`${prefix}/disclaimer`);
      const title = (await page.locator("h1").boundingBox())!;
      const description = (await page.locator(".legal-subtitle").boundingBox())!;
      expect(description.y - title.y - title.height).toBeCloseTo(48, 0);
    }
});
