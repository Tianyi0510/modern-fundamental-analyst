import { expect, test } from "@playwright/test";

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  for (const width of [390, 1440]) {
    test(
      `${prefix || "English"} ${width}px production styles agree across direct, client and history navigation`,
      width === 390 ? { tag: "@mobile" } : {},
      async ({ page, context }) => {
        const errors: string[] = [];
        page.on("pageerror", (error) => errors.push(error.message));
        await page.setViewportSize({ width, height: 900 });
        const contact = `${prefix}/contact`;
        const sample = async (target = page) => {
          await target.evaluate(() => document.fonts.ready);
          return target.locator("h1, .contact-submit, .footer-mark").evaluateAll((elements) =>
            elements.map((element) => {
              const style = getComputedStyle(element);
              return {
                text: element.textContent,
                color: style.color,
                opacity: style.opacity,
                fontFamily: style.fontFamily,
                fontSize: style.fontSize,
                background: style.backgroundColor,
                width: element.getBoundingClientRect().width,
              };
            }),
          );
        };
        const baseline = await context.newPage();
        baseline.on("pageerror", (error) => errors.push(error.message));
        await baseline.setViewportSize({ width, height: 900 });
        await baseline.goto(contact);
        await expect(baseline.locator(".contact-submit")).toBeVisible();
        const direct = await sample(baseline);
        await page.goto(prefix || "/");
        await page.locator(".cta .button").click();
        await expect(page).toHaveURL(contact);
        await expect(page.locator(".contact-submit")).toBeVisible();
        expect(await sample()).toEqual(direct);
        await page.goBack();
        await expect(page.locator(".hero h1")).toBeVisible();
        await page.goForward();
        await expect(page.locator(".contact-submit")).toBeVisible();
        expect(await sample()).toEqual(direct);
        expect(errors).toEqual([]);
      },
    );
  }
}
