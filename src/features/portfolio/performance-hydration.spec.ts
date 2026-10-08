import { expect, test } from "@playwright/test";

for (const { prefix, date } of [
  { prefix: "", date: "30 Sep 2026" },
  { prefix: "/zh-tw", date: "2026年9月30日" },
  { prefix: "/zh-cn", date: "2026年9月30日" },
]) {
  test(
    `${prefix || "English"} chart dates hydrate without browser errors`,
    { tag: "@mobile" },
    async ({ page, request }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      const path = `${prefix}/performance`;
      const response = await request.get(path);
      expect(response.ok()).toBe(true);
      expect(await response.text()).toContain(date);

      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(path);
      const chart = page.locator('figure[aria-labelledby="performance-twr-chart-title"]');
      await expect(chart.getByRole("img")).toHaveAccessibleName(new RegExp(date));
      const summary = chart.locator("summary");
      await summary.click();
      await expect(summary).toHaveAttribute("aria-expanded", "true");
      await expect(chart.getByRole("table")).toBeVisible();
      await summary.click();
      await expect(summary).toHaveAttribute("aria-expanded", "false");
      expect(errors).toEqual([]);
    },
  );
}
