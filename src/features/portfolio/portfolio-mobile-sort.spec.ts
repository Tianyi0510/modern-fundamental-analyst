import { expect, test } from "@playwright/test";
import { portfolioHoldings, portfolioIncome, getPortfolioTotals, getHoldingCostPerShare } from "./portfolio";
import { formatUsd } from "@/lib/format";

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  test(`${prefix || "English"} portfolio mobile sorting changes the rendered order without overflow`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${prefix}/portfolio`);

    const mobileSort = page.locator(".portfolio-mobile-sort");
    await expect(mobileSort).toBeVisible();
    const table = page.getByRole("table");
    await expect(table).toHaveJSProperty("tagName", "TABLE");
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
    await page.addStyleTag({ content: "html { font-size: 200%; }" });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
}
