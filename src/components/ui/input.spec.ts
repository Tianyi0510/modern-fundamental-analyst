import { expect, test } from "@playwright/test";

for (const width of [390, 1440]) {
  test.describe(`field feedback at ${width}px`, () => {
    test.use({
      viewport: { width, height: 900 },
      hasTouch: width === 390,
      reducedMotion: width === 390 ? "reduce" : "no-preference",
    });

    test(
      "pending contact and subscription fields recover after failure",
      width === 390 ? { tag: "@mobile" } : {},
      async ({ page }) => {
        let release: (() => void) | undefined;
        await page.route(/\/api\/(?:contact|subscribe)$/, async (route) => {
          await new Promise<void>((resolve) => {
            release = resolve;
          });
          await route.fulfill({ status: 503, json: { error: "Unavailable" } });
        });
        await page.goto("/contact");
        const contact = page.locator("form").filter({ has: page.locator('textarea[name="message"]') });
        await contact.locator('[name="name"]').fill("Reader");
        await contact.locator('[name="email"]').fill("reader@example.com");
        await contact.locator('[name="subject"]').fill("Research question");
        await contact.locator('[name="message"]').fill("A question about the portfolio.");
        const subscribe = page.locator(".site-footer form");
        await subscribe.locator('[name="email"]').fill("reader@example.com");

        for (const form of [contact, subscribe]) {
          const controls = form.locator('input:not([type="hidden"]):not([name="website"]), textarea');
          const colors = await controls.evaluateAll((elements) =>
            elements.map((element) => getComputedStyle(element).color),
          );
          await form.locator('button[type="submit"]').click();
          await expect.poll(() => typeof release).toBe("function");
          for (const control of await controls.all()) {
            await expect(control).toBeDisabled();
            await expect(control).toHaveCSS("cursor", "not-allowed");
            await expect(control).toHaveCSS("border-top-style", "dashed");
          }
          expect(
            await controls.evaluateAll((elements) => elements.map((element) => getComputedStyle(element).color)),
          ).toEqual(colors);
          release?.();
          release = undefined;
          await expect(form.getByRole("status")).not.toBeEmpty();
          for (const control of await controls.all()) {
            await expect(control).toBeEnabled();
            await expect(control).toHaveCSS("border-top-style", "solid");
            await expect(control).not.toHaveCSS("cursor", "not-allowed");
          }
          await controls.first().focus();
          await expect(controls.first()).toBeFocused();
        }
      },
    );
  });
}
