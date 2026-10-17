import { expect, test } from "@playwright/test";

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  test(`${prefix || "English"} holdings and footer links expose list semantics across layouts`, async ({ page }) => {
    await page.goto(prefix || "/");
    const researchTitle = page.getByRole("heading", {
      name: /Published investment research for independent evaluation|公開投資研究，\s*供讀者獨立評估|公开投资研究，\s*供读者独立评估/,
    });
    await expect(researchTitle).toBeVisible();
    const holdings = page.locator(".holdings-list");
    const links = page.locator(".footer-links");
    const aboutLabel =
      prefix === "" ? "Explore the investment approach" : prefix === "/zh-tw" ? "探索投資研究方式" : "探索投资研究方式";
    const about = page.getByRole("link", { name: aboutLabel, exact: true });
    await expect(about).toHaveAttribute("href", `${prefix}/about`);
    await expect(holdings).toMatchAriaSnapshot(`
      - list:
        - listitem
        - listitem
        - listitem
        - listitem
    `);
    await expect(links.getByRole("listitem")).toHaveCount(6);
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      await expect(holdings).toBeVisible();
      await expect(links).toBeVisible();
      await expect(about).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      const contact = links.getByRole("link").first();
      await contact.focus();
      await expect(contact).toBeFocused();
      await expect(contact).toHaveAttribute("href", `${prefix}/contact`);
    }
    await page.addStyleTag({ content: "html { font-size: 200%; }" });
    await expect(about).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
    await about.focus();
    await expect(about).toBeFocused();
  });
}
