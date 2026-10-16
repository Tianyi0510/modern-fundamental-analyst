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

for (const width of [390, 1440]) {
  test(
    `semantic component tokens propagate without changing native controls at ${width}px`,
    width === 390 ? { tag: "@mobile" } : {},
    async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/");
      const contactLink = page.locator(".cta .button");
      await expect(contactLink).toHaveJSProperty("tagName", "A");
      await expect(contactLink).toHaveAttribute("href", "/contact");
      await page.evaluate(() => {
        document.documentElement.style.setProperty("--action-primary-surface", "var(--deep-blue)");
      });
      await expect(contactLink).toHaveCSS("background-color", "rgb(0, 41, 145)");
      await expect(page.locator(".hero .button")).toHaveCSS("background-color", "rgb(0, 0, 0)");
      await contactLink.click();
      await expect(page).toHaveURL(/\/contact$/);
      const actions = page.locator('main button[type="submit"]');
      await expect(actions).toHaveCount(2);
      for (const action of await actions.all()) {
        await expect(action).toHaveCSS("background-color", "rgb(0, 41, 145)");
        await expect(action).toBeEnabled();
      }
      const fields = page.locator('main input[type="email"], main textarea');
      await expect(fields).toHaveCount(3);
      await page.evaluate(() => {
        document.documentElement.style.setProperty("--field-surface", "var(--white)");
        document.documentElement.style.setProperty("--field-text", "var(--deep-blue)");
      });
      for (const field of await fields.all()) {
        await expect(field).toHaveCSS("background-color", "rgb(255, 255, 255)");
        await expect(field).toHaveCSS("color", "rgb(0, 41, 145)");
      }
      await expect(page.locator('.site-footer input[type="email"]')).toHaveCSS("color", "rgb(255, 255, 255)");
      await expect(page.locator('.site-footer input[type="email"]')).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    },
  );
}
