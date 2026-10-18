import { expect, test } from "@playwright/test";

test.describe("footer layout and typography", () => {
  test.use({ viewport: { width: 1440, height: 1000 } });

  test("footer status and input text retain their semantic weight", async ({ page }) => {
    for (const width of [1440, 801, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto("/subscription-preferences");
      const status = page.locator(".site-footer [role=status]");
      await expect(status).toHaveCSS("font-size", "16px");
      await expect(status).toHaveCSS("font-weight", "700");
      await expect(status).toBeVisible();
      await expect(page.locator("main input[name=email]").first()).toHaveCSS("font-weight", "400");
      await expect(page.locator(".site-footer input[name=email]")).toHaveCSS("font-weight", "400");
      await page.goto("/disclaimer");
      await expect(page.locator(".site-footer [role=status]")).toHaveCSS("font-size", "16px");
      await expect(page.locator(".site-footer [role=status]")).toHaveCSS("font-weight", "700");
      const inset = await page.locator(".legal-body").evaluate((body) => {
        const first = body.querySelector(".legal-section-heading")!;
        return first.getBoundingClientRect().top - body.getBoundingClientRect().top;
      });
      expect(inset).toBe(96);
    }
  });
});

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  test(`${prefix || "English"} footer wordmark aligns with column headings`, async ({ page }) => {
    await page.goto(`${prefix}/disclaimer`);
    await page.evaluate(() => document.fonts.ready);
    for (const width of [834, 1280, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      const footer = page.locator(".site-footer");
      await footer.scrollIntoViewIfNeeded();
      const logo = await footer.locator(".brand-logo").boundingBox();
      const links = await footer.locator(".footer-heading").boundingBox();
      const subscription = await footer.locator("h2").boundingBox();
      expect(logo).not.toBeNull();
      expect(links).not.toBeNull();
      expect(subscription).not.toBeNull();
      expect(Math.abs(logo!.y - links!.y)).toBeLessThan(1);
      if (width >= 1280) {
        expect(Math.abs(logo!.y - subscription!.y)).toBeLessThan(1);
      } else {
        expect(subscription!.y).toBeGreaterThan(logo!.y + logo!.height);
      }
    }
  });
}

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  test(`${prefix || "English"} footer second row and navigation rhythm align`, async ({ page }) => {
    await page.goto(`${prefix}/disclaimer`);
    await page.evaluate(() => document.fonts.ready);
    for (const width of [390, 834, 1100, 1280, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      const footer = page.locator(".site-footer");
      await footer.scrollIntoViewIfNeeded();
      const geometry = await footer.evaluate((element) => {
        const rect = (selector: string) => {
          const { top, bottom, height } = element.querySelector(selector)!.getBoundingClientRect();
          return { top, bottom, height };
        };
        const descriptionRange = document.createRange();
        descriptionRange.selectNodeContents(element.querySelector(".footer-brand p")!);
        return {
          descriptionTextTop: descriptionRange.getBoundingClientRect().top,
          logo: rect(".footer-mark"),
          heading: rect(".footer-heading"),
          subscription: rect("h2"),
          description: rect(".footer-brand p"),
          input: rect("input[type=email]"),
          submit: rect("button[type=submit]"),
          preferences: rect(".subscribe-preferences"),
          links: Array.from(element.querySelectorAll(".footer-links a"), (link) => {
            const range = document.createRange();
            range.selectNodeContents(link.querySelector("span") ?? link);
            return { top: link.getBoundingClientRect().top, textTop: range.getBoundingClientRect().top };
          }),
        };
      });
      expect(Math.abs(geometry.logo.height - geometry.heading.height)).toBeLessThan(1);
      expect(Math.abs(geometry.subscription.height - geometry.heading.height)).toBeLessThan(1);
      const precedingControl = width <= 800 ? geometry.submit : geometry.input;
      expect(Math.abs(geometry.preferences.top - precedingControl.bottom - 12)).toBeLessThan(1);
      const step = geometry.links[1].top - geometry.links[0].top;
      expect(Math.abs(geometry.links[0].top - geometry.heading.top - step)).toBeLessThan(1);
      for (let index = 1; index < geometry.links.length; index++) {
        expect(Math.abs(geometry.links[index].top - geometry.links[index - 1].top - step)).toBeLessThan(1);
      }
      expect(Math.abs(geometry.description.top - geometry.logo.bottom - 12)).toBeLessThan(1);
      expect(Math.abs(geometry.input.top - geometry.subscription.bottom - 12)).toBeLessThan(1);
      if (width > 800) {
        expect(Math.abs(geometry.description.top - geometry.links[0].top)).toBeLessThan(1);
        expect(Math.abs(geometry.descriptionTextTop - geometry.links[0].textTop)).toBeLessThan(1);
      }
      if (width > 1100) {
        expect(Math.abs(geometry.description.top - geometry.input.top)).toBeLessThan(1);
      }
    }
  });
}
