import { expect, test } from "@playwright/test";

for (const [prefix, label] of [
  ["", "On This Page"],
  ["/zh-tw", "本頁目錄"],
  ["/zh-cn", "本页目录"],
]) {
  test(`${prefix || "English"} article outline opens and targets unique headings @mobile`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`${prefix}/memos/microsoft-stock-analysis-fiscal-year-2024`);
    const toc = page.locator(".memo-toc");
    const trigger = toc.getByRole("button", { name: label });
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(toc.getByRole("navigation")).toBeHidden();
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    const nav = toc.getByRole("navigation", { name: label });
    await expect(nav).toBeVisible();
    const links = nav.getByRole("link");
    const headings = page.locator(".article-body h2, .article-body h3");
    await expect(links).toHaveCount(await headings.count());
    const targets = await links.evaluateAll((elements) => elements.map((element) => element.getAttribute("href")));
    expect(new Set(targets).size).toBe(targets.length);
    for (const link of await links.all()) {
      const href = await link.getAttribute("href");
      await expect(page.locator(href!)).toHaveText((await link.textContent())!.trim());
    }
    const conclusions = nav.getByRole("link", { name: "Investment conclusion", exact: true });
    await expect(conclusions).toHaveCount(3);
    await conclusions.last().click();
    await expect(page).toHaveURL(/#investment-conclusion-3$/);
    await expect(page.locator("#investment-conclusion-3")).toBeInViewport();
    await trigger.scrollIntoViewIfNeeded();
    await trigger.focus();
    await page.keyboard.press("Space");
    await expect(nav).toBeHidden();
    await expect(trigger).toBeFocused();
    for (const width of [320, 834, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await trigger.click();
      await expect(nav).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      if (width === 320) {
        await page.screenshot({ path: testInfo.outputPath("memo-toc-mobile.png") });
      }
      await trigger.click();
      await expect(nav).toBeHidden();
    }
  });
}
