import { expect, test } from "@playwright/test";

// This journey reaches the real route with Playwright's isolated provider configuration.
test(
  "contact submission preserves input when the email service is unavailable",
  { tag: "@mobile" },
  async ({ page }, testInfo) => {
    // Isolate the real rate limiter across browser projects, repeats and retries.
    await page.setExtraHTTPHeaders({ "x-forwarded-for": `2001:db8::${testInfo.workerIndex + 1}:${testInfo.retry}` });
    await page.goto("/");
    await page.locator(".cta .button").click();
    await expect(page).toHaveURL("/contact");
    const form = page.getByRole("region", { name: "Send a Message", exact: true });
    await form.getByRole("textbox", { name: "Name", exact: true }).fill("Reader");
    await form.getByRole("textbox", { name: "Email", exact: true }).fill("reader@example.com");
    await form.getByRole("textbox", { name: "Subject", exact: true }).fill("Portfolio question");
    const message = form.getByRole("textbox", { name: "Message", exact: true });
    await message.fill("Please explain the portfolio returns.");
    const responsePromise = page.waitForResponse(
      (response) => response.url().endsWith("/api/contact") && response.request().method() === "POST",
    );
    await form.getByRole("button", { name: "Send Message" }).click();
    const response = await responsePromise;
    expect(response.status()).toBe(503);
    await expect(form.getByRole("status")).toHaveText("Your message couldn't be sent. Please try again later.");
    await expect(message).toHaveValue("Please explain the portfolio returns.");
    await expect(form.getByRole("button", { name: "Send Message" })).toBeEnabled();
    await expect(form.locator("form")).toHaveAttribute("aria-busy", "false");
  },
);
