import { expect, test } from "@playwright/test";

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  test(
    `${prefix || "English"} home portfolio aligns its card and heading`,
    { tag: "@mobile" },
    async ({ page }, testInfo) => {
      for (const width of testInfo.project.name === "webkit" ? [390] : [390, 801, 834, 1024, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.goto(prefix || "/");
        const hero = page.locator(".hero");
        await expect(hero).toHaveCSS("padding-top", "64px");
        await expect(hero).toHaveCSS("padding-bottom", "64px");
        await expect(hero.locator(".eyebrow")).toHaveCount(0);
        await expect(hero.getByRole("heading", { level: 1 })).toHaveCSS("margin-top", "0px");
        await expect(hero.getByRole("heading", { level: 1 })).toHaveCSS("margin-bottom", "48px");
        await page.evaluate(() => document.fonts.ready);
        const about = page.locator(".home-about");
        const aboutLabel = (await about.locator(".section-number").boundingBox())!;
        const aboutTitle = (await about.getByRole("heading", { level: 2 }).boundingBox())!;
        expect(aboutTitle.y - aboutLabel.y - aboutLabel.height).toBeCloseTo(48, 0);
        const section = page.locator(".home-portfolio-section");
        const title = section.getByRole("heading", { level: 2 });
        const label = section.locator(".section-number");
        const card = section.locator(".allocation-card");
        await expect(card).toHaveCSS("padding-top", width > 800 ? "32px" : "24px");
        await expect(card).toHaveCSS("padding-bottom", width > 800 ? "32px" : "24px");
        await expect(card).toHaveCSS("border-radius", "0px");
        const list = section.locator(".holdings-list");
        await expect(title).toBeVisible();
        const heading = (await title.boundingBox())!;
        const eyebrow = (await label.boundingBox())!;
        const allocation = (await card.boundingBox())!;
        const holdings = (await list.boundingBox())!;
        const ring = (await card.locator(".allocation-ring").boundingBox())!;
        const caption = card.locator(".allocation-caption");
        await expect(caption.locator("small")).toHaveCSS("font-size", "16px");
        const labelClearance = await caption.evaluate((element) => {
          const ring = element.previousElementSibling!;
          const bounds = ring.getBoundingClientRect();
          const radius = bounds.width / 2;
          const inset = parseFloat(getComputedStyle(ring, "::before").top);
          const text = document.createRange();
          const lines = Array.from(element.children).flatMap((child) => {
            text.selectNodeContents(child);
            return Array.from(text.getClientRects());
          });
          const distances = lines.flatMap((line) =>
            [line.left, line.right].flatMap((x) =>
              [line.top, line.bottom].map((y) => Math.hypot(x - bounds.left - radius, y - bounds.top - radius)),
            ),
          );
          return radius - inset - Math.max(...distances);
        });
        expect(labelClearance, `Label clearance at ${width}px`).toBeGreaterThanOrEqual(0);
        const legend = (await card.locator(".allocation-legend").boundingBox())!;
        const cardHeader = (await card.locator('[data-slot="card-header"]').boundingBox())!;
        const cardLink = (await card.getByRole("link").boundingBox())!;
        const aboveRing = ring.y - cardHeader.y - cardHeader.height;
        const belowLegend = cardLink.y - legend.y - legend.height;
        expect(aboveRing).toBeGreaterThanOrEqual(24);
        expect(Math.abs(aboveRing - belowLegend)).toBeLessThan(1);
        expect(legend.y - ring.y - ring.height).toBeCloseTo(48, 0);
        expect(heading.y - eyebrow.y - eyebrow.height).toBeCloseTo(48, 0);
        if (width > 800) {
          expect(allocation.y).toBeCloseTo(heading.y, 0);
          expect(allocation.y + allocation.height).toBeCloseTo(holdings.y + holdings.height, 0);
          expect(allocation.x).toBeGreaterThan(heading.x + heading.width);
        } else {
          expect(allocation.y - holdings.y - holdings.height).toBeCloseTo(48, 0);
        }
        await page.evaluate(() => {
          document.documentElement.style.fontSize = "200%";
        });
        await expect(caption.locator("small")).toHaveCSS("font-size", "32px");
        await expect(caption.locator("span")).toHaveCSS("font-size", "76px");
        const enlargedRing = (await card.locator(".allocation-ring").boundingBox())!;
        const enlargedCaption = (await caption.boundingBox())!;
        expect(enlargedCaption.y - enlargedRing.y - enlargedRing.height).toBeCloseTo(16, 0);
        expect(await caption.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
        expect(
          (await card.locator(".allocation-legend").boundingBox())!.y - enlargedCaption.y - enlargedCaption.height,
        ).toBeCloseTo(48, 0);
        if (width > 800) {
          await expect(card).toHaveCSS("grid-column-start", "9");
          await expect(list).toHaveCSS("grid-column-end", "9");
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      }
    },
  );
}
