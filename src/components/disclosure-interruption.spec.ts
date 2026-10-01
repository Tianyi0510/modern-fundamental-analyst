import { expect, test } from "@playwright/test";

for (const route of ["memos", "performance"]) {
  for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
    test(`${prefix || "English"} ${route} disclosure settles on resize and restores focus from closing content`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.goto(`${prefix}/${route}`);
      const details = page.locator(route === "memos" ? ".memo-disclosure" : "figure details");
      await details.locator("summary").evaluate((summary: HTMLElement) => {
        summary.click();
        const animation = summary.parentElement!.getAnimations()[0]!;
        animation.pause();
        animation.currentTime = Number(animation.effect!.getTiming().duration) / 2;
      });
      await page.setViewportSize({ width: 1440, height: 900 });
      await expect.poll(() => details.evaluate((e) => e.getAnimations().length)).toBe(0);
      await expect(details).toHaveAttribute("open", "");
      await expect(details).not.toHaveAttribute("data-closing");
      const contentFocus = details.locator('a, [tabindex="0"]').first();
      await expect(contentFocus).toBeVisible();
      await details.locator("summary").evaluate((summary: HTMLElement) => {
        summary.click();
        const details = summary.parentElement!;
        const animation = details.getAnimations()[0]!;
        animation.pause();
        animation.currentTime = Number(animation.effect!.getTiming().duration) / 2;
        details.querySelector<HTMLElement>('a, [tabindex="0"]')!.focus();
      });
      await expect(contentFocus).toBeFocused();
      await page.setViewportSize({ width: 390, height: 844 });
      await expect(details).not.toHaveAttribute("open");
      await expect(details.locator("summary")).toBeFocused();
      await expect.poll(() => details.evaluate((e) => e.getAnimations().length)).toBe(0);
      await expect(details).not.toHaveAttribute("data-closing");
      await details.locator("summary").click();
      await expect(details).toHaveAttribute("open", "");
      await page.emulateMedia({ reducedMotion: "reduce" });
      await expect.poll(() => details.evaluate((e) => e.getAnimations().length)).toBe(0);
      await details.locator("summary").click();
      await expect(details).not.toHaveAttribute("open");
    });
  }
}

for (const reducedMotion of ["no-preference", "reduce"] as const) {
  for (const route of ["memos", "performance"]) {
    for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
      test(`${prefix || "English"} ${route} closing restores content focus without scrolling under ${reducedMotion}`, async ({
        page,
      }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.emulateMedia({ reducedMotion });
        await page.goto(`${prefix}/${route}`);
        const details = page.locator(route === "memos" ? ".memo-disclosure" : "figure details");
        const summary = details.locator("summary");
        await summary.click();
        await expect(details).toHaveAttribute("open", "");
        await expect.poll(() => details.evaluate((element) => element.getAnimations().length)).toBe(0);
        const contentFocus = details.locator('a, [tabindex="0"]').first();
        await contentFocus.evaluate((element: HTMLElement) => element.focus({ preventScroll: true }));
        await expect(contentFocus).toBeFocused();
        const scrollPosition = await page.evaluate(() => window.scrollY);
        // Programmatic activation preserves content focus until the disclosure handles dismissal.
        await summary.evaluate((element: HTMLElement) => element.click());
        await expect(details).not.toHaveAttribute("open");
        await expect(summary).toBeFocused();
        expect(await page.evaluate(() => window.scrollY)).toBe(scrollPosition);
        await expect(details).not.toHaveAttribute("data-closing");
        await expect.poll(() => details.evaluate((element) => element.getAnimations().length)).toBe(0);

        await summary.click();
        await expect(details).toHaveAttribute("open", "");
        await expect.poll(() => details.evaluate((element) => element.getAnimations().length)).toBe(0);
        const outsideLink = page.locator(".site-footer a").first();
        await outsideLink.evaluate((element: HTMLElement) => element.focus({ preventScroll: true }));
        await summary.evaluate((element: HTMLElement) => element.click());
        await expect(details).not.toHaveAttribute("open");
        await expect(outsideLink).toBeFocused();
      });
    }
  }
}
