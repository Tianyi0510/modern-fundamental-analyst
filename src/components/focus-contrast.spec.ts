import { expect, test } from "@playwright/test";
import { colorContrast } from "../../scripts/color-contrast";

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  test(`${prefix || "English"} dark chart disclosure and table have contrasting keyboard focus @mobile`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto(`${prefix}/performance`);
    await page.locator(".header-actions [data-theme-toggle]").click();
    await page.keyboard.press("Tab");
    const summary = page.locator('main [data-slot="collapsible-trigger"]').first();
    await summary.focus();
    {
      const target = summary;
      await expect(target).toBeFocused();
      const colors = await target.evaluate((element) => ({
        ring: getComputedStyle(element).outlineColor,
        background: getComputedStyle(document.body).backgroundColor,
        visible: element.matches(":focus-visible"),
      }));
      expect(colors.visible).toBe(true);
      expect(colorContrast(colors.ring, colors.background)).toBeGreaterThanOrEqual(3);
    }
  });
}

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  test(
    `${prefix || "English"} focus rings contrast on brand and inverse surfaces`,
    { tag: "@mobile" },
    async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`${prefix}/contact`);
      await page.keyboard.press("Tab");
      const contactButton = page.locator(".contact-submit");
      await contactButton.focus();
      await expect(contactButton).toBeFocused();
      const contact = await contactButton.evaluate((element) => ({
        ring: getComputedStyle(element).outlineColor,
        background: getComputedStyle(element.closest(".contact-band")!).backgroundColor,
        style: getComputedStyle(element).outlineStyle,
      }));
      expect(contact.style).toBe("solid");
      expect(colorContrast(contact.ring, contact.background)).toBeGreaterThanOrEqual(3);
      const footerButton = page.locator("footer button[type=submit]");
      await footerButton.focus();
      await expect(footerButton).toBeFocused();
      await expect(footerButton).toHaveCSS("outline-style", "solid");
      const footer = await footerButton.evaluate((element) => ({
        ring: getComputedStyle(element).outlineColor,
        background: getComputedStyle(element.closest("footer")!).backgroundColor,
      }));
      expect(colorContrast(footer.ring, footer.background)).toBeGreaterThanOrEqual(3);
      const preferences = page.locator("footer .subscribe-preferences");
      await preferences.focus();
      await expect(preferences).toBeFocused();
      await expect(preferences).toHaveCSS("outline-style", "solid");
      expect(
        colorContrast(
          await preferences.evaluate((element) => getComputedStyle(element).outlineColor),
          footer.background,
        ),
      ).toBeGreaterThanOrEqual(3);
    },
  );
}
