import { expect, test } from "@playwright/test";

for (const reducedMotion of ["no-preference", "reduce"] as const) {
  for (const route of ["memos", "performance"]) {
    for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
      test(
        `${prefix || "English"} ${route} Collapsible reflows and restores focus under ${reducedMotion}`,
        { tag: "@mobile" },
        async ({ page }) => {
          await page.setViewportSize({ width: 390, height: 844 });
          await page.emulateMedia({ reducedMotion });
          await page.goto(`${prefix}/${route}`);
          const root = page.locator(
            route === "memos"
              ? ".memo-disclosure"
              : '[aria-labelledby="performance-twr-chart-title"] [data-slot="collapsible"]',
          );
          const trigger = root.locator('[data-slot="collapsible-trigger"]');
          const panel = root.locator('[data-slot="collapsible-content"]');
          await expect(trigger).toHaveAttribute("aria-expanded", "false");
          await expect(panel).toBeHidden();
          await trigger.focus();
          await page.keyboard.press("Enter");
          await expect(trigger).toHaveAttribute("aria-expanded", "true");
          await expect(panel).toBeVisible();
          await page.setViewportSize({ width: 801, height: 900 });
          await expect.poll(() => panel.evaluate((element) => element.getAnimations().length)).toBe(0);
          expect(await panel.evaluate((element) => element.clientHeight >= element.scrollHeight - 1)).toBe(true);
          await trigger.evaluate((element) => {
            document.documentElement.style.scrollBehavior = "auto";
            window.scrollTo({ top: element.getBoundingClientRect().top + scrollY - 200, behavior: "instant" });
          });
          const target = panel.locator('a, [tabindex="0"]').first();
          await target.evaluate((element: HTMLElement) => element.focus({ preventScroll: true }));
          const focusScroll = await trigger.evaluate((element: HTMLElement) => {
            const before = scrollY;
            element.click();
            return scrollY - before;
          });
          expect(focusScroll).toBe(0);
          await expect(trigger).toBeFocused();
          await expect(trigger).toHaveAttribute("aria-expanded", "false");
          await expect(panel).toBeHidden();
          await page.keyboard.press("Space");
          await expect(panel).toBeVisible();
          await trigger.click();
          await trigger.click();
          await expect(trigger).toHaveAttribute("aria-expanded", "true");
          await page.setViewportSize({ width: 390, height: 844 });
          await expect.poll(() => panel.evaluate((element) => element.getAnimations().length)).toBe(0);
          await expect(target).toBeVisible();
          expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
          await page.emulateMedia({ reducedMotion: "reduce" });
          await trigger.click();
          await expect(panel).toBeHidden();
          expect(await panel.evaluate((element) => element.getAnimations().length)).toBe(0);
        },
      );
    }
  }
}
