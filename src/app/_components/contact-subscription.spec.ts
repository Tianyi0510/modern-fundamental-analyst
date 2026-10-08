import { expect, test } from "@playwright/test";

for (const { prefix, locale, title, success, error } of [
  {
    prefix: "",
    locale: "en",
    title: "Subscribe",
    success: "Check your inbox and confirm your subscription.",
    error: "Your subscription couldn’t be completed. Please try again.",
  },
  {
    prefix: "/zh-tw",
    locale: "zh-tw",
    title: "訂閱",
    success: "請查看電子郵件並確認你的訂閱。",
    error: "無法完成你的訂閱，請再試一次。",
  },
  {
    prefix: "/zh-cn",
    locale: "zh-cn",
    title: "订阅",
    success: "请查看电子邮件并确认你的订阅。",
    error: "无法完成你的订阅，请重试。",
  },
]) {
  test(`${locale} Contact subscription retries independently of the footer`, async ({ page }) => {
    let releaseRequest!: () => void;
    const pendingRequest = new Promise<void>((resolve) => {
      releaseRequest = resolve;
    });
    const requests: { key: string | null; body: unknown }[] = [];
    await page.route("**/api/subscribe", async (route) => {
      requests.push({
        key: await route.request().headerValue("Idempotency-Key"),
        body: route.request().postDataJSON(),
      });
      if (requests.length === 1) {
        await pendingRequest;
        await route.fulfill({ status: 503, json: { error: "Unavailable" } });
      } else {
        await route.fulfill({ json: { ok: true } });
      }
    });
    await page.goto(`${prefix}/contact`);
    const section = page.getByRole("main").getByRole("region", { name: title, exact: true });
    await expect(section.getByRole("heading", { level: 2 })).toHaveText(title);
    await expect(page.locator(".contact-grid")).toHaveCount(0);
    const messageForm = page.locator(".contact-form");
    expect((await section.boundingBox())!.y).toBeLessThan((await messageForm.boundingBox())!.y);
    const email = section.getByRole("textbox");
    await expect(email).toHaveAccessibleName(/Email Address|電子郵件地址|电子邮件地址/);
    await expect(section.getByRole("link")).toHaveAttribute("href", `${prefix}/subscription-preferences`);
    const footer = page.locator(".site-footer .subscribe-section");
    await email.fill("reader@example.com");
    const submit = section.getByRole("button");
    await submit.click();
    await expect(submit).toBeDisabled();
    await expect(email).toBeDisabled();
    await expect(section.locator("form")).toHaveAttribute("aria-busy", "true");
    await expect(footer.getByRole("button")).toBeEnabled();
    releaseRequest();
    await expect(section.getByRole("status")).toHaveText(error);
    await expect(email).toHaveValue("reader@example.com");
    await submit.click();
    await expect(section.getByRole("status")).toHaveText(success);
    await expect(email).toHaveValue("");
    expect(requests).toHaveLength(2);
    expect(requests[0]?.key).toBeTruthy();
    expect(requests[1]?.key).toBe(requests[0]?.key);
    expect(requests[0]?.body).toEqual({ email: "reader@example.com", website: "", locale });
    await expect(footer.getByRole("status")).toBeEmpty();
    await email.fill("another@example.com");
    await expect(section.getByRole("status")).toBeEmpty();
    const ids = await page.locator("[id]").evaluateAll((elements) => elements.map((element) => element.id));
    expect(new Set(ids).size).toBe(ids.length);
    for (const width of [320, 390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate(() => {
        document.documentElement.style.fontSize = "32px";
      });
      await page.evaluate(() => document.fonts.ready);
      await expect(submit).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    }
  });
}
