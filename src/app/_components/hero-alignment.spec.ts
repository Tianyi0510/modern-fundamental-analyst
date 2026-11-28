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
    await expect(card.locator("strong")).toHaveText("$121,085.13");
    // A 390px window with a classic scrollbar has about 375px of usable width.
    await page.setViewportSize({ width: 375, height: 900 });
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

for (const locale of ["en", "zh-tw", "zh-cn"] as const) {
  test(`${locale} mobile titles preserve whole words and Chinese phrases @mobile`, async ({ page }) => {
    const cases = [
      ["/", ["價值投資"], ["价值投资"]],
      ["/about", ["投資決策"], ["投资决策"]],
      ["/portfolio", ["投資組合"], ["投资组合"]],
      ["/memos", ["企業品質"], ["企业质量"]],
      ["/memos/microsoft-stock-analysis-fiscal-year-2024", ["股票分析", "財政年度"], ["股票分析", "财政年度"]],
      ["/support", ["投資研究"], ["投资研究"]],
      ["/disclaimer", ["免責聲明"], ["免责声明"]],
      ["/subscription-preferences", ["你的訂閱"], ["你的订阅"]],
    ] as const;
    for (const [route, traditional, simplified] of cases) {
      await page.goto((locale === "en" ? "" : "/" + locale) + route);
      await page.evaluate(() => document.fonts.ready);
      const heading = page.getByRole("heading", { level: 1 });
      for (const width of [320, 375, 390, 430]) {
        await page.setViewportSize({ width, height: 844 });
        const broken = await heading.evaluate(
          (h, phrases) => {
            const walker = document.createTreeWalker(h, NodeFilter.SHOW_TEXT);
            const nodes: Text[] = [];
            while (walker.nextNode()) nodes.push(walker.currentNode as Text);
            const failures = [];
            for (const phrase of phrases ?? nodes.flatMap((n) => n.data.match(/[A-Za-z]+/g) ?? [])) {
              const node = nodes.find((n) => n.data.includes(phrase));
              if (!node) {
                failures.push(phrase);
                continue;
              }
              const start = node.data.indexOf(phrase);
              const r = document.createRange();
              r.setStart(node, start);
              r.setEnd(node, start + phrase.length);
              const rects = [...r.getClientRects()];
              if (rects.length !== 1 || rects[0]!.left < 0 || rects[0]!.right > innerWidth) failures.push(phrase);
            }
            return failures;
          },
          locale === "en" ? null : [...(locale === "zh-tw" ? traditional : simplified)],
        );
        expect(broken, route + " at " + width).toEqual([]);
      }
    }
  });
}
