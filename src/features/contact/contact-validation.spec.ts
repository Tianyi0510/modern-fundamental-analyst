import { expect, test } from "@playwright/test";

for (const copy of [
  {
    prefix: "",
    name: "Enter your name.",
    subject: "Enter a subject.",
    message: "Enter a message with at least 10 characters.",
    summary: "Check the required fields, then send your message again.",
    success: "Your message has been sent. Thank you for reaching out.",
  },
  {
    prefix: "/zh-tw",
    name: "請輸入姓名。",
    subject: "請輸入主旨。",
    message: "請輸入至少 10 個字元的訊息。",
    summary: "請檢查必填欄位後，再次傳送訊息。",
    success: "訊息已成功傳送，感謝你的聯絡。",
  },
  {
    prefix: "/zh-cn",
    name: "请输入姓名。",
    subject: "请输入主题。",
    message: "请输入至少 10 个字符的信息。",
    summary: "请检查必填项后，再次发送信息。",
    success: "信息已成功发送，感谢你的联系。",
  },
]) {
  test(
    `${copy.prefix || "English"} Contact identifies invalid fields and distinguishes HTTP 400`,
    { tag: "@mobile" },
    async ({ page }, testInfo) => {
      await page.setViewportSize({ width: 390, height: 844 });
      let requests = 0;
      const keys: (string | undefined)[] = [];
      await page.route("**/api/contact", async (route) => {
        requests++;
        keys.push(route.request().headers()["idempotency-key"]);
        await route.fulfill({
          status: requests === 1 ? 400 : 200,
          contentType: "application/json",
          body: JSON.stringify(requests === 1 ? { error: "Synthetic validation rejection" } : { ok: true }),
        });
      });
      await page.goto(`${copy.prefix}/contact`);
      const form = page.locator("main form").filter({ has: page.locator("textarea") });
      const name = form.locator('[name="name"]');
      const subject = form.locator('[name="subject"]');
      const message = form.locator('[name="message"]');
      const submit = form.locator('button[type="submit"]');
      await name.fill("   ");
      await form.locator('[name="email"]').fill("reader@example.com");
      await subject.fill("   ");
      await message.fill("          ");
      await submit.click();
      await expect(name).toBeFocused();
      await expect(name).toHaveAccessibleDescription(copy.name);
      await expect(name).toHaveAttribute("aria-invalid", "true");
      expect(requests).toBe(0);
      if (copy.prefix === "" && testInfo.project.name === "chromium") {
        await page.locator(".contact-section").screenshot({ path: testInfo.outputPath("inline-validation.png") });
      }
      await name.fill("Reader");
      await expect(name).not.toHaveAttribute("aria-invalid", "true");
      await submit.click();
      await expect(subject).toBeFocused();
      await expect(subject).toHaveAccessibleDescription(copy.subject);
      await subject.fill("Research question");
      await submit.click();
      await expect(message).toBeFocused();
      await expect(message).toHaveAccessibleDescription(copy.message);
      expect(requests).toBe(0);
      await message.fill("Please explain the portfolio methodology.");
      await submit.click();
      const status = form.getByRole("status");
      await expect(status).toHaveText(copy.summary);
      await expect(status).toBeFocused();
      await expect(message).toHaveValue("Please explain the portfolio methodology.");
      await expect(page.locator("main .subscribe-section input[type=email]")).toHaveValue("");
      await submit.click();
      await expect(status).toHaveText(copy.success);
      await expect(message).toHaveValue("");
      expect(requests).toBe(2);
      expect(keys[0]).toBeTruthy();
      expect(keys[1]).toBe(keys[0]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    },
  );
}
