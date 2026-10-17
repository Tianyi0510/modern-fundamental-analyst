import { expect, test } from "@playwright/test";
import { colorContrast } from "../../../scripts/color-contrast";

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  test(`${prefix || "English"} financial summaries associate labels, values, notes and snapshot dates`, async ({
    page,
  }) => {
    for (const [route, selector, count] of [
      ["/", ".metric-band", 3],
      ["/portfolio", ".portfolio-kpis", 3],
      ["/performance", ".performance-summary", 3],
    ] as const) {
      await page.goto(`${prefix}${route}`);
      if (route === "/portfolio") {
        const positions =
          prefix === "/zh-tw"
            ? /^\d+ 個已揭露部位。$/
            : prefix === "/zh-cn"
              ? /^\d+ 个已披露持仓。$/
              : /^\d+ Disclosed Positions\.$/;
        const holdings = page.getByRole("region", { name: positions });
        await expect(holdings).toBeVisible();
        await expect(holdings.getByRole("heading", { level: 2, name: positions })).toBeVisible();
        await expect(holdings.getByRole("table")).toBeVisible();
        await expect(page.getByRole("heading", { name: "Allocation by market value", exact: true })).toHaveCount(0);
        await expect(page.getByText("Source Sheet:", { exact: false })).toHaveCount(0);
      }
      const summary = page.locator(selector);
      await expect(summary).toHaveJSProperty("tagName", "DL");
      await expect(summary.getByRole("term")).toHaveCount(count);
      await expect(summary.getByRole("definition")).toHaveCount(count * 2);
      for (const group of await summary.locator(":scope > div").all()) {
        await expect(group.locator("dt")).not.toBeEmpty();
        await expect(group.locator("dd.kpi-value")).not.toBeEmpty();
        await expect(group.locator("dd.kpi-note")).not.toBeEmpty();
      }
      const date = page.locator('main time[datetime="2026-09-30"]').first();
      await expect(date).toBeVisible();
      await expect(date).not.toBeEmpty();
      for (const width of [1440, 390]) {
        await page.setViewportSize({ width, height: 900 });
        const value = summary.locator(".kpi-value").first();
        const note = summary.locator(".kpi-note").first();
        const valueBox = (await value.boundingBox())!;
        const noteBox = (await note.boundingBox())!;
        expect(noteBox.y).toBeGreaterThanOrEqual(valueBox.y + valueBox.height);
        const notes = await summary.locator(":scope > div").evaluateAll((groups) =>
          groups.map((group) => {
            const note = getComputedStyle(group.querySelector(".kpi-note small")!);
            return {
              tone: group.getAttribute("data-tone"),
              color: note.color,
              valueColor: getComputedStyle(group.querySelector(".kpi-value strong")!).color,
              opacity: Number(note.opacity),
              background: getComputedStyle(group).backgroundColor,
            };
          }),
        );
        for (const sample of notes) {
          expect(sample.color, `${route} ${sample.tone} note matches its value at ${width}px`).toBe(sample.valueColor);
          expect(sample.opacity).toBe(0.8);
          expect(
            colorContrast(sample.color, sample.background, sample.opacity),
            `${route} ${sample.tone} note contrast at ${width}px`,
          ).toBeGreaterThanOrEqual(4.5);
        }
      }
      await page.addStyleTag({ content: "html { font-size: 200%; }" });
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    }
  });

  test(`${prefix || "English"} page sections and memo publication dates retain their meaning`, async ({ page }) => {
    await page.goto(`${prefix}/about`);
    await expect(page.locator(".about-boundaries > section")).toHaveCount(2);
    await expect(page.locator(".about-boundaries > article")).toHaveCount(0);
    await page.goto(`${prefix}/disclaimer`);
    await expect(page.locator("section.legal-section")).toHaveCount(3);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await page.goto(`${prefix}/memos`);
    await expect(page.locator('.page-intro time[datetime="2025-10-10"]')).toBeVisible();
    const memo = page.locator("a.memo-card").first();
    const publication = memo.locator("time");
    const date = await publication.getAttribute("datetime");
    const displayed = await publication.innerText();
    await page.locator(".memo-disclosure > summary").click();
    const indexDate = page.locator(".memo-meta time").first();
    await expect(indexDate).toBeVisible();
    await expect(indexDate).toHaveAttribute("datetime", date!);
    await expect(indexDate).toHaveText(displayed);
    await memo.click();
    await expect(page.getByRole("article")).toHaveCount(1);
    await expect(page.locator(".article-meta time")).toHaveAttribute("datetime", date!);
    await expect(page.locator(".article-meta time")).toHaveText(displayed);
  });
}

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  for (const width of [1440, 390]) {
    test(`${prefix || "English"} headings reflect their page context at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`${prefix}/disclaimer`);
      const sections = page.locator(".legal-section");
      await expect(sections).toHaveCount(3);
      for (const section of await sections.all()) {
        await expect(section.getByRole("heading", { level: 2 })).toHaveCount(1);
        await expect(section.getByRole("heading", { level: 2 })).toBeVisible();
      }
      await page.goto(`${prefix}/memos`);
      const headings = page.locator(".memo-card").getByRole("heading", { level: 2, includeHidden: true });
      await expect(headings).toHaveCount(3);
      await expect(page.locator(".memo-card").getByRole("heading", { level: 3, includeHidden: true })).toHaveCount(0);
      await page.locator(".memo-disclosure > summary").click();
      await expect(page.locator(".memo-index-row").first().getByRole("heading", { level: 2 })).toHaveText(
        await headings.first().innerText(),
      );
      await page.goto(prefix || "/");
      await expect(page.locator(".memos-home").getByRole("heading", { level: 2 })).toHaveCount(1);
      await expect(page.locator(".memo-card").getByRole("heading", { level: 3, includeHidden: true })).toHaveCount(3);
    });
  }
}
