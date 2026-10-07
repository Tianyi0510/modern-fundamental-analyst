import { expect, test } from "@playwright/test";

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  test(`${prefix || "English"} legacy memo redirects permanently and retains page landmarks`, async ({
    page,
    request,
  }) => {
    const destination = `${prefix}/memos/microsoft-stock-analysis-fiscal-year-2024`;
    const response = await request.get(`${prefix}/memos/microsoft-stock-analysis-fy2024`, { maxRedirects: 0 });
    expect(response.status()).toBe(308);
    expect(new URL(response.headers().location!, response.url()).pathname).toBe(destination);
    await page.goto(destination);
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("main").locator(".site-header, .site-footer")).toHaveCount(0);
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
    await expect(page.getByRole("main").getByRole("heading", { level: 1 })).toContainText(
      prefix === "/zh-tw" ? "微軟" : prefix === "/zh-cn" ? "微软" : "Microsoft",
    );
  });
}
