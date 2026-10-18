import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"]) {
  test(`foundation aliases preserve layout and materials in ${theme} mode`, async ({ page }, testInfo) => {
    await page.emulateMedia({ colorScheme: theme === "dark" ? "dark" : "light", reducedMotion: "no-preference" });
    await page.goto("/contact");
    await expect(page.locator("[data-theme-toggle]").first()).toBeEnabled();
    for (const width of [390, 834, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      const shell = page.locator("header.shell");
      const expectedWidth = width === 390 ? 358 : width === 834 ? 770 : 1312;
      await expect(shell).toHaveCSS("width", `${expectedWidth}px`);
      await expect(page.locator("body")).toHaveCSS(
        "background-color",
        theme === "light" ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)",
      );
    }
    await page.locator(".language-trigger").click();
    const popup = page.locator('[data-slot="dropdown-menu-content"]');
    await expect(popup).toBeVisible();
    await expect(popup).toHaveCSS("background-color", theme === "light" ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)");
    await expect(popup).toHaveCSS("border-radius", "12px");
    await expect(popup).toHaveCSS("z-index", "auto");
    const shadow = await popup.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(shadow).toContain("0px 16px 24px -8px");
    expect(shadow).toContain("0px 4px 8px -4px");
    await page.screenshot({ path: testInfo.outputPath("foundation.png") });
    await page.evaluate(() => {
      const root = document.documentElement.style;
      root.setProperty("--material-popup", "rgb(12, 34, 56)");
      root.setProperty("--material-popup-text", "rgb(240, 241, 242)");
      root.setProperty("--shadow-popover", "0 2px 4px rgb(0 0 0 / 0.2)");
      root.setProperty("--width-content", "1200px");
    });
    await expect(popup).toHaveCSS("background-color", "rgb(12, 34, 56)");
    await expect(popup).toHaveCSS("color", "rgb(240, 241, 242)");
    await expect(popup).toHaveCSS("box-shadow", /rgba\(0, 0, 0, 0\.2\) 0px 2px 4px 0px$/);
    await expect(page.locator("header.shell")).toHaveCSS("width", "1200px");
    await page.keyboard.press("Escape");
    await expect(page.locator(".language-trigger")).toBeFocused();
  });
}
