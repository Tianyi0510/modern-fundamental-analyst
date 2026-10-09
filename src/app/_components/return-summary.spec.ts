import { expect, test } from "@playwright/test";

for (const { prefix, label, note } of [
  { prefix: "", label: "TWRR", note: "Time-Weighted Return · Reconstructed · Cumulative" },
  { prefix: "/zh-tw", label: "TWRR", note: "時間加權報酬・重建值・累積" },
  { prefix: "/zh-cn", label: "TWRR", note: "时间加权回报・重建值・累计" },
]) {
  test(`${prefix || "English"} Home and Performance display the same reconstructed TWR`, async ({ page }) => {
    for (const path of ["/", "/performance"]) {
      await page.goto(`${prefix}${path}`);
      const metric = page.getByRole("main").getByRole("term").filter({ hasText: label }).locator("..");
      await expect(metric.locator("strong")).toHaveText("+38.27%");
      await expect(metric.locator("small")).toHaveText(note);
      const xirrNote =
        prefix === "/zh-tw"
          ? "資金加權報酬・年化"
          : prefix === "/zh-cn"
            ? "资金加权回报・年化"
            : "Money-Weighted Return · Annualized";
      await expect(page.locator(path === "/" ? ".metric-band" : ".performance-summary")).toContainText(xirrNote);
      if (path === "/") {
        await expect(page.locator(".metric-band dt").last()).toHaveText("XIRR");
        if (!prefix)
          await expect(page.getByRole("link", { name: "Read the Latest Investment Memo", exact: true })).toBeVisible();
      }
      await page.addStyleTag({ content: "html { font-size: 32px !important; }" });
      for (const width of [320, 390, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await page.evaluate(() => document.fonts.ready);
        await expect(metric).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      }
    }
  });
}
