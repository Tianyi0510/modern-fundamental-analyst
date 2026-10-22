import { expect, test } from "@playwright/test";

for (const hostname of ["localhost", "127.0.0.1"]) {
  test(`local preview hydrates after reload on ${hostname} @mobile`, async ({ page, baseURL }) => {
    const origin = new URL(baseURL!);
    origin.hostname = hostname;
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(origin.href);

    for (let visit = 0; visit < 2; visit++) {
      if (visit) await page.reload();
      // Unlike a rendered menu trigger, this control becomes enabled only after hydration.
      await expect(page.getByRole("button", { name: "Subscribe", exact: true })).toBeEnabled();
      await page.getByRole("button", { name: "Open menu", exact: true }).click();
      const menu = page.getByRole("dialog", { name: "Site menu", exact: true });
      await expect(menu).toBeVisible();
      await menu.getByRole("button", { name: "English", exact: true }).click();
      await expect(menu.getByRole("link", { name: "繁體中文", exact: true })).toBeVisible();
      await menu.getByRole("button", { name: "Close menu", exact: true }).click();
      await expect(menu).toBeHidden();
    }
    expect(errors).toEqual([]);
  });
}

test("development assets accept loopback origins and reject unrelated origins", async ({ page, request }) => {
  test.skip(process.env.PLAYWRIGHT_USE_PRODUCTION_BUILD === "1", "Development-only origin protection");
  await page.goto("/");
  const script = page.locator('script[src^="/_next/"]').first();
  await expect(script).toHaveAttribute("src", /^\/_next\//);
  const asset = await script.getAttribute("src");
  for (const origin of ["http://localhost:3210", "http://127.0.0.1:3210"]) {
    const response = await request.get(asset!, { headers: { Origin: origin } });
    expect(response.status()).toBe(200);
  }
  const denied = await request.get(asset!, { headers: { Origin: "https://untrusted.example" } });
  expect(denied.status()).toBe(403);
});
