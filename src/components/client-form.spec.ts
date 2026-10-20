import { expect, test } from "@playwright/test";

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  test(`${prefix || "English"} private forms stay disabled without JavaScript @mobile`, async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({ baseURL, javaScriptEnabled: false });
    try {
      const page = await context.newPage();
      for (const route of ["contact", "subscription-preferences"]) {
        await page.goto(`${prefix}/${route}`);
        const forms = page.locator("form");
        expect(await forms.count()).toBeGreaterThan(0);
        for (const form of await forms.all()) {
          await expect(form).toHaveAttribute("method", "post");
          await expect(form.locator('button[type="submit"]')).toBeDisabled();
          await expect(form.locator("noscript")).toBeVisible();
          expect(await form.evaluate((element) => [...new FormData(element as HTMLFormElement).keys()])).toEqual([]);
        }
        expect(new URL(page.url()).search).toBe("");
      }
    } finally {
      await context.close();
    }
  });
}
