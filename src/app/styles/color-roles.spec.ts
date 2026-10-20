import { expect, test, type Locator } from "@playwright/test";

// Compare rendered styles with the approved palette, independently of token names.
async function expectColor(locator: Locator, property: string, original: string) {
  const expected = await locator.evaluate(
    (element, { property, original }) => {
      const probe = document.createElement("span");
      probe.style.setProperty(property, original);
      element.append(probe);
      const value = getComputedStyle(probe).getPropertyValue(property);
      probe.remove();
      return value;
    },
    { property, original },
  );
  await expect(locator).toHaveCSS(property, expected);
}

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  test(`${prefix || "English"} color roles preserve strokes and interaction states`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(prefix || "/");
    await expectColor(page.locator(".footer-bottom"), "border-top-color", "var(--border-inverse-subtle)");
    await expectColor(page.locator(".allocation-card > a"), "border-top-color", "var(--allocation-divider)");
    await expectColor(
      page.locator(".allocation-legend li:nth-child(4) i"),
      "border-top-color",
      "var(--allocation-swatch-border)",
    );
    await expectColor(page.locator(".performance-bars"), "border-left-color", "var(--chart-axis-border)");
    await expectColor(page.locator(".year-bar small").first(), "color", "var(--text-secondary)");
    const holding = page.locator(".holding-row").first();
    await holding.hover();
    await expectColor(holding, "background-color", "var(--holding-row-hover-surface)");
    const card = page.locator("a.memo-card").first();
    await card.hover();
    await expectColor(card, "background-color", "var(--memo-card-hover-surface)");
    await page.mouse.down();
    // Existing hover takes precedence over :active on desktop.
    await expectColor(card, "background-color", "var(--memo-card-hover-surface)");
    await page.mouse.move(0, 0);
    await page.mouse.up();
    await expectColor(card, "background-color", "white");

    await page.goto(`${prefix}/memos`);
    const summary = page.locator(".memo-disclosure > [data-slot=collapsible-trigger]");
    await summary.hover();
    await expectColor(summary, "background-color", "var(--memo-disclosure-hover-surface)");
    await summary.click();
    const row = page.locator(".memo-index-row").first();
    await row.hover();
    await expectColor(row, "background-color", "var(--memo-row-hover-surface)");

    await page.goto(`${prefix}/portfolio`);
    const portfolioRow = page.locator(".portfolio-row").first();
    await portfolioRow.hover();
    await expectColor(portfolioRow, "background-color", "var(--portfolio-row-hover-surface)");
    await expectColor(portfolioRow, "border-top-color", "#eef0f2");

    await page.goto(`${prefix}/support`);
    const option = page.locator(".support-amount-option").first();
    await option.hover();
    await expectColor(option, "background-color", "var(--support-option-hover-surface)");
    await option.click();
    await expect(option.locator("input")).toBeChecked();
    await expectColor(option, "background-color", "#0d288b");
    await expectColor(option, "color", "white");
    await page.mouse.move(0, 0);
    await expectColor(option, "background-color", "#0d288b");
  });

  test(`${prefix || "English"} touch card retains its softer pressed color`, { tag: "@mobile" }, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(prefix || "/");
    const card = page.locator("a.memo-card").first();
    await card.scrollIntoViewIfNeeded();
    await card.hover();
    await page.mouse.down();
    await expectColor(card, "background-color", "var(--memo-card-hover-surface)");
    await page.mouse.move(0, 0);
    await page.mouse.up();
    await expectColor(card, "background-color", "white");
  });
}
