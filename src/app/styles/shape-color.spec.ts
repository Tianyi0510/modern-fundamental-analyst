import { expect, test, type Page } from "@playwright/test";

function controlsCase(prefix: string, width: number) {
  return async ({ page }: { page: Page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`${prefix}/contact`);
    const field = page.locator('input[name="name"]');
    await expect(field).toHaveCSS("border-radius", "8px");
    await expect(field).toHaveCSS("background-color", "rgb(248, 249, 251)");
    await expect(field).toHaveCSS("border-top-color", "rgba(0, 0, 0, 0.72)");
    await field.focus();
    await expect(field).toHaveCSS("outline-color", "rgb(0, 41, 145)");

    const submit = page.locator(".contact-submit");
    await expect(submit).toHaveCSS("border-radius", "999px");
    await expect(submit).toHaveCSS("background-color", "rgb(0, 41, 145)");
    await expect(submit).toHaveCSS("color", "rgb(255, 255, 255)");
    await submit.focus();
    await expect(submit).toHaveCSS("background-color", "color(srgb 0.1 0.244706 0.611765)");
    await expect(submit).toHaveCSS("color", "rgb(255, 255, 255)");

    const inverse = page.locator('footer input[type="email"]');
    await expect(inverse).toHaveCSS("border-radius", "999px");
    await expect(inverse).toHaveCSS("border-top-color", "rgba(255, 255, 255, 0.7)");
    expect(await inverse.evaluate((element) => getComputedStyle(element, "::placeholder").color)).toBe(
      "rgba(255, 255, 255, 0.72)",
    );
    await inverse.focus();
    await expect(inverse).toHaveCSS("outline-color", "rgb(95, 205, 253)");

    const trigger = page.locator(width === 390 ? ".mobile-menu-button" : ".language-trigger");
    await trigger.click();
    const surface = page.getByRole(width === 390 ? "dialog" : "menu");
    await expect(surface).toBeVisible();
    if (width === 390) {
      await expect(page.locator(".mobile-menu-content")).toHaveCSS("transform", "none");
      await expect(page.locator(".mobile-menu-content")).toHaveCSS("background-color", "rgb(255, 255, 255)");
      await expect(surface).toHaveCSS("box-shadow", "none");
      await expect(page.locator(".mobile-menu-close")).toHaveCSS("background-color", "rgb(95, 205, 253)");
    } else {
      await expect(trigger).toHaveCSS("color", "rgb(0, 41, 145)");
      await expect(surface).toHaveCSS("border-radius", "12px");
      await expect(surface).toHaveCSS("background-color", "rgb(255, 255, 255)");
      await expect(surface).toHaveCSS("border-top-color", "rgb(237, 237, 237)");
    }
    await page.keyboard.press("Escape");
    await expect(surface).toBeHidden();
    await expect(trigger).toBeFocused();
  };
}

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  test(`${prefix || "English"} shape and color roles preserve desktop controls`, controlsCase(prefix, 1440));
  test(
    `${prefix || "English"} shape and color roles preserve mobile controls`,
    { tag: "@mobile" },
    controlsCase(prefix, 390),
  );
}
