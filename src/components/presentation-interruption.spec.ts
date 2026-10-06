import { expect, test } from "@playwright/test";

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  test(`${prefix || "English"} navigation and disclosure reverse without losing isolation`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto(`${prefix}/performance`);
    const trigger = page.locator(".mobile-menu-button");
    const close = page.locator(".mobile-menu-close");
    const layer = page.locator(".mobile-menu-layer");
    await trigger.click();
    await expect(layer).toHaveAttribute("data-menu-phase", "open");
    await close.evaluate((button: HTMLButtonElement) => button.click());
    await expect(layer).toHaveAttribute("data-menu-phase", "closing");
    await page.locator(".mobile-menu-content").evaluate((content) => {
      const animation = content.getAnimations()[0]!;
      animation.pause();
      animation.currentTime = Number(animation.effect!.getTiming().duration) / 2;
      // Repeated intent can arrive from another control while the visible modal remains isolated.
      document.querySelector<HTMLButtonElement>(".mobile-menu-button")!.click();
    });
    await expect(layer).toHaveAttribute("data-menu-phase", "open");
    await expect(close).toBeFocused();
    await expect
      .poll(() => page.locator("main").evaluate((element) => Boolean(element.closest('[aria-hidden="true"]'))))
      .toBe(true);
    await page.keyboard.press("Escape");
    await expect(layer).toBeHidden();
    await expect(trigger).toBeFocused();
    await expect
      .poll(() => page.locator("main").evaluate((element) => Boolean(element.closest('[aria-hidden="true"]'))))
      .toBe(false);
    await expect
      .poll(() => page.evaluate(() => document.querySelector(".mobile-menu-content")?.getAnimations().length ?? 0))
      .toBe(0);

    for (const details of await page.locator("figure details").all()) {
      const summary = details.locator("summary");
      await summary.click();
      await expect(details).toHaveAttribute("data-state", "open");
      await summary.evaluate((element: HTMLElement) => {
        element.click();
        const animation = element.parentElement!.getAnimations()[0]!;
        animation.pause();
        animation.currentTime = Number(animation.effect!.getTiming().duration) / 2;
      });
      await expect(summary).toHaveAttribute("aria-expanded", "false");
      await expect(details.locator(":scope > div")).toHaveAttribute("inert", "");
      await summary.evaluate((element: HTMLElement) => element.click());
      await expect(details).toHaveAttribute("data-state", "open");
      await expect(summary).toHaveAttribute("aria-expanded", "true");
      await expect(details.locator(":scope > div")).not.toHaveAttribute("inert");
      await expect.poll(() => details.evaluate((e) => e.getAnimations().length)).toBe(0);
    }
  });
}

test.describe("interrupted touch feedback", () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });
  test("reduced motion settles a released ring and preserves held feedback", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    const trigger = page.locator(".mobile-menu-button");
    const ring = trigger.locator(".mobile-menu-touch-ring");
    await trigger.evaluate((button) => {
      for (const type of ["pointerdown", "pointerup"]) {
        button.dispatchEvent(
          new PointerEvent(type, { bubbles: true, pointerType: "touch", pointerId: 7, isPrimary: true }),
        );
      }
      const animation = button.querySelector(".mobile-menu-touch-ring")!.getAnimations()[0]!;
      animation.pause();
      animation.currentTime = Number(animation.effect!.getTiming().duration) / 2;
    });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect.poll(() => ring.evaluate((element) => element.getAnimations().length)).toBe(0);
    await expect(ring).toHaveCSS("opacity", "0");
    await trigger.evaluate((button) =>
      button.dispatchEvent(
        new PointerEvent("pointerdown", { bubbles: true, pointerType: "touch", pointerId: 8, isPrimary: true }),
      ),
    );
    await expect(ring).toHaveCSS("opacity", "1");
    await trigger.evaluate((button) =>
      button.dispatchEvent(
        new PointerEvent("pointercancel", { bubbles: true, pointerType: "touch", pointerId: 8, isPrimary: true }),
      ),
    );
    await expect(ring).toHaveCSS("opacity", "0");
  });
});
