import { execFileSync } from "node:child_process";
import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"]) {
  test(`component borders and notification shadows follow semantic tokens in ${theme} mode`, async ({ page }) => {
    await page.goto("/contact");
    const markup = execFileSync(
      process.execPath,
      ["--import", "./scripts/register-server.mjs", "./src/components/ui/theming-fixture.mjs"],
      { encoding: "utf8" },
    );
    await page.evaluate(
      ({ markup, theme }) => {
        document.documentElement.dataset.theme = theme;
        document.body.insertAdjacentHTML("beforeend", markup);
      },
      { markup, theme },
    );
    const fixture = page.locator("#token-fixture");
    const borders = fixture.locator(
      '[data-slot="toast"], [data-slot="table-row"], [data-slot="table-footer"], [data-slot="card-footer"], [data-slot="alert-dialog-footer"]',
    );
    await expect(borders).toHaveCount(6);
    const notification = fixture.locator('[data-slot="toast"]');
    const notificationShadow = await notification.evaluate((element) => getComputedStyle(element).boxShadow);
    expect(notificationShadow).toContain("0px 4px 8px 0px");
    await fixture.evaluate((element) =>
      (element as HTMLElement).style.setProperty("--shadow-notification", "0 2px 4px rgb(0 0 0 / 0.2)"),
    );
    await expect(notification).toHaveCSS("box-shadow", /rgba\(0, 0, 0, 0\.2\) 0px 2px 4px 0px$/);
    for (const element of await borders.all()) {
      await expect(element).toHaveCSS("border-top-color", theme === "light" ? "rgb(238, 240, 242)" : "rgb(51, 51, 51)");
    }
    await fixture.evaluate((element) => {
      (element as HTMLElement).style.setProperty("--border-subtle", "rgb(12, 34, 56)");
    });
    for (const element of await borders.all()) {
      await expect(element).toHaveCSS("border-top-color", "rgb(12, 34, 56)");
    }
  });
}
