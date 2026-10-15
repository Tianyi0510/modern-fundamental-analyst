import { expect, test } from "@playwright/test";

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  test(
    `${prefix || "English"} disclosure reversal retains momentum without clipping its summary`,
    { tag: "@mobile" },
    async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.goto(`${prefix}/performance`);
      const details = page.locator('[aria-labelledby="performance-twr-chart-title"] details');
      const summary = details.locator("summary");
      await summary.click();
      await expect(details).toHaveAttribute("data-state", "open");
      await summary.click();
      await expect(details).toHaveAttribute("data-state", "closed");
      const samples = await details.evaluate((element: HTMLDetailsElement) => {
        const summary = element.querySelector("summary")!;
        summary.click();
        const opening = element.getAnimations()[0]!;
        opening.pause();
        opening.currentTime = 100;
        const before = element.getBoundingClientRect().height;
        summary.click();
        const closing = element.getAnimations()[0]!;
        closing.pause();
        closing.currentTime = 0;
        const start = element.getBoundingClientRect().height;
        closing.currentTime = 1000 / 120;
        const next = element.getBoundingClientRect().height;
        const minimum = summary.getBoundingClientRect().height;
        const timing = Number(closing.effect!.getTiming().duration);
        let lowest = Infinity;
        for (let time = 0; time <= timing; time += 16) {
          closing.currentTime = time;
          lowest = Math.min(lowest, element.getBoundingClientRect().height);
        }
        closing.finish();
        return { before, start, next, lowest, minimum };
      });
      expect(Math.abs(samples.start - samples.before)).toBeLessThan(1);
      expect(samples.next).toBeGreaterThan(samples.start);
      expect(samples.lowest).toBeGreaterThanOrEqual(samples.minimum);
      await expect(details).not.toHaveAttribute("open");
      await expect(summary).toHaveAttribute("aria-expanded", "false");
      await expect(summary).toBeFocused();
    },
  );

  test(
    `${prefix || "English"} Menu reverses a moving spring and settles on compact resize`,
    { tag: "@mobile" },
    async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.goto(prefix || "/");
      const trigger = page.locator(".mobile-menu-button");
      const close = page.locator(".mobile-menu-close");
      const layer = page.locator(".mobile-menu-layer");
      const panel = page.locator(".mobile-menu-content");
      await trigger.click();
      await expect(layer).toHaveAttribute("data-menu-phase", "open");
      const before = await panel.evaluate((element) => {
        document.querySelector<HTMLButtonElement>(".mobile-menu-close")!.click();
        return element.getBoundingClientRect().x;
      });
      await expect(layer).toHaveAttribute("data-menu-phase", "closing");
      const moving = await panel.evaluate((element) => {
        const animation = element.getAnimations()[0]!;
        animation.pause();
        animation.currentTime = 100;
        const x = element.getBoundingClientRect().x;
        document.querySelector<HTMLButtonElement>(".mobile-menu-button")!.click();
        return x;
      });
      expect(moving).toBeGreaterThan(before);
      await expect(layer).toHaveAttribute("data-menu-phase", "opening");
      const samples = await panel.evaluate((element) => {
        const animation = element.getAnimations()[0]!;
        animation.pause();
        animation.currentTime = 0;
        const start = element.getBoundingClientRect().x;
        animation.currentTime = 1000 / 120;
        const next = element.getBoundingClientRect().x;
        animation.currentTime = 350;
        return { start, next, boundedLeft: element.getBoundingClientRect().x };
      });
      expect(Math.abs(samples.start - moving)).toBeLessThan(1);
      expect(samples.next).toBeGreaterThan(samples.start);
      expect(samples.boundedLeft).toBeGreaterThanOrEqual(0);
      await page.setViewportSize({ width: 430, height: 844 });
      await expect(layer).toHaveAttribute("data-menu-phase", "open");
      await expect.poll(() => panel.evaluate((element) => element.getAnimations().length)).toBe(0);
      await expect(close).toBeFocused();
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.keyboard.press("Escape");
      await expect(layer).toBeHidden();
      await expect(trigger).toBeFocused();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    },
  );
}
