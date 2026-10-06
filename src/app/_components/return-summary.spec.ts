import { expect, test } from "@playwright/test";

for (const { prefix, label, note } of [
  { prefix: "", label: "Time-Weighted Return", note: "Reconstructed · cumulative · not annualized" },
  { prefix: "/zh-tw", label: "時間加權報酬", note: "重建值・累積・未年化" },
  { prefix: "/zh-cn", label: "时间加权回报", note: "重建值・累计・未年化" },
]) {
  test(`${prefix || "English"} Home, Portfolio and Performance display the same reconstructed TWR`, async ({
    page,
  }) => {
    for (const path of ["/", "/portfolio", "/performance"]) {
      await page.goto(`${prefix}${path}`);
      const metric = page.getByRole("main").getByRole("term").filter({ hasText: label }).locator("..");
      await expect(metric.locator("strong")).toHaveText("+38.27%");
      await expect(metric.locator("small")).toHaveText(note);
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
