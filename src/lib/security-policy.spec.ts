import { expect, test } from "@playwright/test";

test("CSP blocks untrusted scripts and HTML event handlers", { tag: "@mobile" }, async ({ page }) => {
  let externalRequested = false;
  await page.route("https://untrusted-script.invalid/**", async (route) => {
    externalRequested = true;
    await route.fulfill({
      contentType: "application/javascript",
      body: "document.body.dataset.externalScript = 'ran'",
    });
  });
  await page.goto("/contact");
  const blocked = await page.evaluate(
    () =>
      new Promise<boolean>((resolve) => {
        const script = document.createElement("script");
        script.src = "https://untrusted-script.invalid/check.js";
        script.onload = () => resolve(false);
        script.onerror = () => resolve(true);
        document.head.append(script);
      }),
  );
  expect(blocked).toBe(true);
  expect(externalRequested).toBe(false);
  await page.evaluate(() => {
    const button = document.createElement("button");
    button.setAttribute("onclick", "document.body.dataset.inlineHandler = 'ran'");
    document.body.append(button);
    button.click();
    button.remove();
  });
  await expect(page.locator("body")).not.toHaveAttribute("data-inline-handler", "ran");
  await expect(page.locator("body")).not.toHaveAttribute("data-external-script", "ran");
});
