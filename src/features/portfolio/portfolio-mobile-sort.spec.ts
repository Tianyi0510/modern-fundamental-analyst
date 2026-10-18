import { expect, test } from "@playwright/test";
import { portfolioHoldings, portfolioIncome } from "./portfolio";
import { getPortfolioTotals, getHoldingCostPerShare } from "./portfolio-calculations";
import { formatUsd } from "@/lib/format";

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  test(
    `${prefix || "English"} portfolio mobile sorting changes the rendered order without overflow`,
    { tag: "@mobile" },
    async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`${prefix}/portfolio`);

      const mobileSort = page.locator(".portfolio-mobile-sort");
      await expect(mobileSort).toBeVisible();
      await expect(mobileSort.locator("select")).toHaveAttribute("data-slot", "native-select");
      await expect(mobileSort.getByRole("button")).toHaveAttribute("data-slot", "button");
      const table = page.getByRole("table");
      await expect(table).toHaveJSProperty("tagName", "TABLE");
      await expect(table).toHaveAttribute("data-slot", "table");
      await expect(table.locator("tbody tr").first()).toHaveAttribute("data-slot", "table-row");
      await expect(table.locator("tbody th").first()).toHaveAttribute("data-slot", "table-head");
      await expect(table.locator("tbody td").first()).toHaveAttribute("data-slot", "table-cell");
      await expect(table.locator("tfoot")).toHaveAttribute("data-slot", "table-footer");
      const holdingRows = table.locator("tbody").getByRole("row");
      await expect(table.getByRole("rowheader")).toHaveCount((await holdingRows.count()) + 1);
      await expect(table.locator("tfoot").getByRole("row")).toHaveCount(1);
      const headers = table.getByRole("columnheader");
      await expect(headers).toHaveCount(7);
      const labels = await mobileSort.locator("select option").allTextContents();
      for (const [index, label] of labels.entries()) {
        await expect(headers.nth(index)).toHaveAccessibleName(label);
      }
      await expect(headers.nth(4)).toHaveAttribute("aria-sort", "descending");
      await expect(page.locator(".table-head button").first()).toBeHidden();
      expect(await page.locator(".portfolio-row:not(.portfolio-total-row)").count()).toBeGreaterThan(0);
      await mobileSort.locator("select").selectOption("shares");
      await expect(mobileSort.locator("select")).toHaveValue("shares");
      const sharesHeader = headers.nth(1);
      await expect(sharesHeader).toHaveAttribute("aria-sort", "descending");

      const shares = () =>
        page
          .locator(".portfolio-row:not(.portfolio-total-row)")
          .evaluateAll((rows) => rows.map((row) => Number(row.children[1]?.textContent?.replaceAll(",", ""))));
      await expect.poll(shares).toEqual((await shares()).toSorted((a, b) => b - a));

      await mobileSort.locator("button").click();
      await expect(sharesHeader).toHaveAttribute("aria-sort", "ascending");
      await expect.poll(shares).toEqual((await shares()).toSorted((a, b) => a - b));

      await mobileSort.locator("select").selectOption("costBasis");
      await expect(headers.nth(3)).toHaveAttribute("aria-sort", "descending");
      const expectedHoldings = portfolioHoldings.toSorted(
        (a, b) => getHoldingCostPerShare(b) - getHoldingCostPerShare(a),
      );
      await expect(holdingRows.getByRole("rowheader")).toHaveText(expectedHoldings.map((holding) => holding.symbol));
      for (const [index, holding] of expectedHoldings.entries()) {
        await expect(holdingRows.nth(index).getByRole("cell").nth(2)).toHaveText(
          formatUsd(getHoldingCostPerShare(holding)),
        );
      }
      await expect(table.locator("tfoot .portfolio-total-market")).toHaveText(
        formatUsd(getPortfolioTotals(portfolioHoldings, portfolioIncome).marketValue),
      );

      await mobileSort.locator("select").selectOption("shares");

      await mobileSort.locator("button").click();

      await page.setViewportSize({ width: 320, height: 844 });
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
      await page.setViewportSize({ width: 390, height: 844 });
      await page.addStyleTag({ content: "html { font-size: 200%; }" });
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    },
  );
  test(`${prefix || "English"} sorting survives a mobile-desktop-mobile round trip`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${prefix}/portfolio`);
    const mobileSort = page.locator(".portfolio-mobile-sort");
    const table = page.getByRole("table");
    const holdingRows = table.locator("tbody").getByRole("row");
    const sharesHeader = table.getByRole("columnheader").nth(1);
    const shares = () =>
      page
        .locator(".portfolio-row:not(.portfolio-total-row)")
        .evaluateAll((rows) => rows.map((row) => Number(row.children[1]?.textContent?.replaceAll(",", ""))));
    await mobileSort.locator("select").selectOption("shares");
    await mobileSort.locator("button").click();
    await expect(sharesHeader).toHaveAttribute("aria-sort", "ascending");
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(mobileSort).toBeHidden();
    await expect(page.locator(".table-head")).toBeVisible();
    const sharesButton = sharesHeader.getByRole("button");
    await sharesButton.focus();
    await sharesButton.press("Enter");
    await expect(sharesHeader).toHaveAttribute("aria-sort", "descending");
    await expect.poll(shares).toEqual((await shares()).toSorted((a, b) => b - a));
    await expect(holdingRows.first().getByRole("rowheader")).toHaveCSS("text-align", "left");
    await expect(holdingRows.first().getByRole("cell").first()).toHaveCSS("text-align", "right");
    await expect(table.locator(".portfolio-total-market")).toHaveCSS("font-weight", "700");
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(mobileSort).toBeVisible();
    await expect(mobileSort.locator("select")).toHaveAttribute("data-slot", "native-select");
    await expect(mobileSort.getByRole("button")).toHaveAttribute("data-slot", "button");
    await expect(mobileSort.locator("select")).toHaveValue("shares");
    await expect(sharesButton).toBeHidden();
    await expect(sharesHeader).toHaveAttribute("aria-sort", "descending");
    await expect.poll(shares).toEqual((await shares()).toSorted((a, b) => b - a));
    await page.addStyleTag({ content: "html { font-size: 200%; }" });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
}

test("mobile sorting controls share dimensions and use one press transform", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/portfolio");
  const group = page.locator(".portfolio-mobile-sort");
  const select = group.locator("select");
  const direction = group.getByRole("button");
  await direction.scrollIntoViewIfNeeded();
  const selectBounds = (await select.boundingBox())!;
  const buttonBounds = (await direction.boundingBox())!;
  expect(buttonBounds.height).toBeCloseTo(selectBounds.height, 0);
  expect(buttonBounds.width).toBeCloseTo(selectBounds.width, 0);
  await direction.hover();
  await page.mouse.down();
  await expect(direction).toHaveCSS("scale", "none");
  const pressScale = await direction.evaluate((element) =>
    Number(getComputedStyle(element).getPropertyValue("--motion-scale-press").trim()),
  );
  await expect(direction).toHaveCSS("transform", `matrix(${pressScale}, 0, 0, ${pressScale}, 0, 0)`);
  await expect(direction.locator("svg")).toHaveCSS("transform", "none");
  await page.mouse.up();
  await page.mouse.move(0, 0);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await direction.hover();
  await page.mouse.down();
  await expect(direction).toHaveCSS("transform", "none");
  await page.mouse.up();
});
