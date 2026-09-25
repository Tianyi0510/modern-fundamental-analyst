import { expect, test } from "@playwright/test";

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  test(`${prefix || "English"} portfolio mobile sorting changes the rendered order without overflow`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${prefix}/portfolio`);

    const mobileSort = page.locator(".portfolio-mobile-sort");
    await expect(mobileSort).toBeVisible();
    await expect(page.locator(".table-head")).toBeHidden();
    expect(await page.locator(".portfolio-row:not(.portfolio-total-row)").count()).toBeGreaterThan(0);
    await mobileSort.locator("select").selectOption("shares");
    await expect(mobileSort.locator("select")).toHaveValue("shares");
    const sharesHeader = page.locator('.table-head [role="columnheader"]').nth(1);
    await expect(sharesHeader).toHaveAttribute("aria-sort", "descending");

    const shares = () =>
      page
        .locator(".portfolio-row:not(.portfolio-total-row)")
        .evaluateAll((rows) =>
          rows.map((row) => Number(row.querySelectorAll('[role="cell"]')[1]?.textContent?.replaceAll(",", ""))),
        );
    await expect.poll(shares).toEqual((await shares()).toSorted((a, b) => b - a));

    await mobileSort.locator("button").click();
    await expect(sharesHeader).toHaveAttribute("aria-sort", "ascending");
    await expect.poll(shares).toEqual((await shares()).toSorted((a, b) => a - b));

    await page.setViewportSize({ width: 320, height: 844 });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(mobileSort).toBeHidden();
    await expect(page.locator(".table-head")).toBeVisible();
  });
}
