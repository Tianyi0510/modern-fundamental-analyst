import { expect, test } from "@playwright/test";

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  test(`${prefix || "English"} holdings and footer links expose list semantics across layouts`, async ({ page }) => {
    await page.goto(prefix || "/");
    const holdings = page.locator(".holdings-list");
    const links = page.locator(".footer-links");
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
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      const contact = links.getByRole("link").first();
      await contact.focus();
      await expect(contact).toBeFocused();
      await expect(contact).toHaveAttribute("href", `${prefix}/contact`);
    }
  });
}
