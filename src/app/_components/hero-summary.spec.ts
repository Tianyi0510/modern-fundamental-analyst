import { expect, test } from "@playwright/test";

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  for (const mobile of [false, true]) {
    test(
      `${prefix || "English"} Hero summaries align on ${mobile ? "mobile" : "desktop"}`,
      mobile ? { tag: "@mobile" } : {},
      async ({ page }) => {
        for (const width of mobile ? [320, 390] : [801, 900, 1440]) {
          await page.setViewportSize({ width, height: 1000 });
          for (const route of ["", "/portfolio", "/performance"]) {
            await page.goto(`${prefix}${route}` || "/");
            await page.evaluate(() => document.fonts.ready);
            for (const enlarged of [false, true]) {
              if (enlarged) await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
              const hero = page.locator(".hero, .page-hero");
              const summary = hero.locator("dl");
              const following = page.locator(
                route === "" ? ".home-about" : route === "/portfolio" ? ".portfolio-holdings-section" : ".returns",
              );
              await expect(following).toHaveCSS("padding-top", "48px");
              await expect(summary).toBeVisible();
              if (route === "/portfolio") {
                await expect(summary.getByRole("term")).toHaveCount(3);
                await expect(
                  summary.getByRole("term").filter({ hasText: /Net Cost basis|淨成本基礎|净成本基础/ }),
                ).toHaveCount(0);
                await expect(page.locator(".portfolio-holdings-section")).toHaveCSS(
                  "background-color",
                  "rgb(255, 255, 255)",
                );
                for (const value of await summary.locator("strong").all()) {
                  expect(
                    await value.evaluate((e) => {
                      const r = document.createRange();
                      r.selectNodeContents(e);
                      return new Set([...r.getClientRects()].map((b) => Math.round(b.top))).size;
                    }),
                  ).toBe(1);
                }
              }
              const geometry = await hero.evaluate((element) => {
                const b = element.getBoundingClientRect();
                const dl = element.querySelector("dl")!.getBoundingClientRect();
                const preceding = element.querySelector(".hero-bottom, .page-intro")!.getBoundingClientRect();
                const heading = element.querySelector("h1")!.getBoundingClientRect();
                return {
                  left: b.left,
                  right: b.right,
                  bottom: b.bottom,
                  dlLeft: dl.left,
                  dlRight: dl.right,
                  dlBottom: dl.bottom,
                  gap: dl.top - preceding.bottom,
                  headingLeft: heading.left,
                };
              });
              expect(geometry.dlLeft).toBeCloseTo(geometry.headingLeft, 0);
              expect(geometry.dlRight).toBeCloseTo(geometry.right, 0);
              expect(geometry.left).toBeGreaterThan(0);
              expect(geometry.gap).toBeCloseTo(48, 0);
              expect(geometry.bottom - geometry.dlBottom).toBeCloseTo(48, 0);
              for (const card of await summary.locator("[data-tone]").all()) {
                expect(
                  await card.evaluate((e) => e.scrollWidth <= e.clientWidth && e.scrollHeight <= e.clientHeight),
                ).toBe(true);
              }
              expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
            }
          }
        }
      },
    );
  }
}
