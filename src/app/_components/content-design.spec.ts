import { expect, test } from "@playwright/test";

const routes = [
  "",
  "/about",
  "/portfolio",
  "/performance",
  "/memos",
  "/contact",
  "/support",
  "/disclaimer",
  "/subscription-preferences",
  "/memos/microsoft-stock-analysis-fiscal-year-2024",
];

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  for (const mobile of [false, true]) {
    test(
      `${prefix || "English"} content follows web conventions on ${mobile ? "mobile" : "desktop"}`,
      mobile ? { tag: "@mobile" } : {},
      async ({ page }) => {
        await page.setViewportSize({ width: mobile ? 390 : 1440, height: 1000 });
        for (const route of routes) {
          await page.goto(`${prefix}${route}` || "/");
          await expect(page.locator("main h1")).toHaveCount(1);
          const headings = await page
            .locator("main h1, main h2, main h3, main button, main label, .footer-heading")
            .allTextContents();
          for (const heading of headings) {
            expect(
              heading.trim(),
              `${prefix}${route}: no terminal period in interface headings or controls`,
            ).not.toMatch(/[.。]$/);
          }
          expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
          if (!prefix) {
            if (mobile) {
              await expect(
                page.locator("header").getByRole("button", { name: "Open menu", exact: true }),
              ).toBeVisible();
            } else {
              await expect(
                page.locator("header nav").getByRole("link", { name: "Investment Memos", exact: true }),
              ).toBeVisible();
            }
            if (route === "")
              await expect(
                page.locator(".hero").getByRole("link", { name: "View portfolio", exact: true }),
              ).toBeVisible();
            if (route === "/portfolio") {
              await expect(page.locator("#portfolio-holdings-title")).toHaveText(/^\d+ Disclosed Positions$/);
              await expect(page.locator("main h1")).toHaveText(/A Fully Disclosed\s*Focus Portfolio/);
              await expect(page.getByRole("columnheader").filter({ hasText: "Cost Basis" })).toHaveCount(1);
            }
            if (route === "/performance") {
              await expect(page.locator("#performance-twr-chart-title")).toHaveText("Cumulative Reconstructed TWRR");
              await expect(page.locator("summary").filter({ hasText: "View Monthly Data" })).toHaveCount(2);
            }
            if (route === "/contact") {
              await expect(page.locator("main h1")).toHaveText(/Connect through research,\s*ideas, and opportunities/);
              await expect(page.getByRole("heading", { name: "Send a Message", exact: true })).toBeVisible();
              await expect(page.getByRole("button", { name: "Send Message", exact: true })).toBeVisible();
            }
            if (route === "/support") {
              await expect(page.locator("main h1")).toHaveText(/Support independent\s*research/);
              await expect(page.getByRole("button", { name: "Continue to Stripe", exact: true })).toBeVisible();
            }
            if (route === "/subscription-preferences") {
              await expect(page.locator("main h1")).toHaveText("Manage Your Subscription");
              await expect(page.getByRole("button", { name: "Send Secure Link", exact: true })).toBeVisible();
            }
            if (route === "/about") {
              await expect(page.locator(".page-intro")).toContainText("Tianyi (David) Li");
              await expect(page.locator(".about-copy").first()).toContainText(
                "You can examine this public record over time.",
              );
            }
          }
          await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
          expect(
            await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
            `${prefix}${route}: 200% text reflow`,
          ).toBe(true);
        }
      },
    );
  }
}
