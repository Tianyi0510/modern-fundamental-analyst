import { expect, test } from "@playwright/test";

const locales = [
  { prefix: "", dark: "Switch to Dark Mode", light: "Switch to Light Mode" },
  { prefix: "/zh-tw", dark: "切換至深色模式", light: "切換至淺色模式" },
  { prefix: "/zh-cn", dark: "切换至深色模式", light: "切换至浅色模式" },
];

for (const locale of locales) {
  test(`${locale.prefix || "English"} theme tooltip preserves its name before and after opening`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${locale.prefix}/contact`);
    const button = page.locator(".header-actions [data-theme-toggle]");
    const popup = page.locator('[data-slot="tooltip-content"]');
    await expect(button).toBeEnabled();
    await expect(button).toHaveAccessibleName(locale.dark);
    await expect(button).not.toHaveAttribute("title");
    await expect(button).toHaveAttribute("aria-label", locale.dark);
    await expect(popup).toBeHidden();
    await button.focus();
    await expect(popup).toBeVisible();
    await expect(popup).toHaveText(locale.dark);
    await button.press("Escape");
    await expect(popup).toBeHidden();
    await expect(button).toBeFocused();
    await expect(button).toHaveAccessibleName(locale.dark);
    await button.press("Enter");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(button).toHaveAccessibleName(locale.light);
    await expect(button).toHaveAttribute("aria-label", locale.light);
    await page.locator(".language-trigger").focus();
    await button.hover();
    await expect(popup).toBeVisible();
    await expect(popup).toHaveText(locale.light);
    await button.click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect(popup).toBeHidden();
    await expect(button).toHaveAccessibleName(locale.dark);
  });
}

test.describe("touch theme labels", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  for (const locale of locales) {
    test(`${locale.prefix || "English"} Sheet theme toggle has a name without a tooltip @mobile`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: "light" });
      await page.goto(`${locale.prefix}/contact`);
      await page.locator(".mobile-menu-button").tap();
      const button = page.locator(".mobile-menu-drawer [data-theme-toggle]");
      await expect(button).toHaveAccessibleName(locale.dark);
      await expect(button).not.toHaveAttribute("title");
      await expect(button).toHaveAttribute("aria-label", locale.dark);
      await button.tap();
      await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
      await expect(button).toHaveAccessibleName(locale.light);
      await expect(button).toHaveAttribute("aria-label", locale.light);
      await expect(page.locator('[data-slot="tooltip-content"]')).toBeHidden();
      await expect(page.locator(".mobile-menu-drawer")).toBeVisible();
    });
  }
});
