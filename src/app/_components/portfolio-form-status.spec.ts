import { expect, test } from "@playwright/test";

const locales = [
  {
    prefix: "",
    name: "English",
    contactSuccess: "Your message has been sent.",
    subscribeSuccess: "Check your inbox. Open the confirmation email to finish subscribing.",
    preferencesSuccess: "If this address is subscribed, check your inbox for a secure link to manage your preferences.",
    returnNote:
      "The portfolio accounts for net dividends and financing interest. Individual position returns exclude both.",
  },
  {
    prefix: "/zh-tw",
    name: "Traditional Chinese",
    contactSuccess: "訊息已成功傳送",
    subscribeSuccess: "請查看收件匣，開啟確認郵件以完成訂閱。",
    preferencesSuccess: "若此地址已訂閱",
    returnNote: "整體投資組合的報酬率計入稅後股息，並扣除融資利息。個別持股的報酬率不含這兩項。",
  },
  {
    prefix: "/zh-cn",
    name: "Simplified Chinese",
    contactSuccess: "信息已成功发送",
    subscribeSuccess: "请查看收件箱，打开确认邮件以完成订阅。",
    preferencesSuccess: "如果此地址已订阅",
    returnNote: "整个投资组合的回报率计入税后股息，并扣除融资利息。单只股票或 ETF 的回报率不含这两项。",
  },
] as const;

for (const { prefix, name, contactSuccess, subscribeSuccess, preferencesSuccess, returnNote } of locales) {
  test(`${name} portfolio summary and table show the same cost-basis total return`, async ({ page }) => {
    await page.goto(`${prefix}/portfolio`);
    const summaryReturn = page.locator('.portfolio-kpis [data-tone="brand"] strong');
    const tableReturn = page.locator(".portfolio-total-return");
    await expect(summaryReturn).toHaveText("+26.17%");
    const summary = page.locator('.portfolio-kpis [data-tone="brand"]');
    await expect(summary.getByRole("term")).toHaveText(
      prefix === "/zh-tw" ? "總報酬率" : prefix === "/zh-cn" ? "总回报率" : "Total Return",
    );
    await expect(summary.locator("small")).toHaveText(
      prefix === "/zh-tw" ? "以買入成本計算" : prefix === "/zh-cn" ? "按买入成本计算" : "Return on purchase cost",
    );
    await expect(tableReturn).toHaveText("+26.17%");
    await expect(page.locator(".portfolio-table-wrap + .portfolio-return-note p")).toContainText(returnNote);
  });

  test(`${name} form success clears when entering a new submission`, async ({ page }) => {
    const contactKeys: string[] = [];
    const preferencesKeys: string[] = [];
    await page.route(/\/api\/(?:contact|subscribe|subscription-preferences\/request)$/, async (route) => {
      const path = new URL(route.request().url()).pathname;
      const key = (await route.request().headerValue("Idempotency-Key")) ?? "";
      if (path === "/api/contact") contactKeys.push(key);
      if (path === "/api/subscription-preferences/request") preferencesKeys.push(key);
      await route.fulfill({ json: { ok: true } });
    });

    await page.goto(`${prefix}/contact`);
    const contact = page.locator("form").filter({ has: page.locator('textarea[name="message"]') });
    for (const control of await contact.locator('input:not([type="hidden"]):not([name="website"]), textarea').all()) {
      await expect(control).toHaveAccessibleName(/\S/);
      const id = await control.getAttribute("id");
      await contact.locator(`label[for="${id}"]`).click();
      await expect(control).toBeFocused();
    }
    await contact.locator('[name="name"]').fill("Reader");
    await contact.locator('[name="email"]').fill("reader@example.com");
    await contact.locator('[name="subject"]').fill("First question");
    await contact.locator('[name="message"]').fill("A first question about the portfolio.");
    await contact.locator('button[type="submit"]').click();
    await expect(contact.getByRole("status")).toContainText(contactSuccess);
    await contact.locator('[name="subject"]').fill("Second question");
    await expect(contact.getByRole("status")).toBeEmpty();
    await contact.locator('[name="name"]').fill("Reader");
    await contact.locator('[name="email"]').fill("reader@example.com");
    await contact.locator('[name="message"]').fill("A second question about the portfolio.");
    await contact.locator('button[type="submit"]').click();
    await expect(contact.getByRole("status")).toContainText(contactSuccess);
    expect(contactKeys).toHaveLength(2);
    expect(contactKeys.every(Boolean)).toBe(true);
    expect(new Set(contactKeys).size).toBe(2);

    const subscribe = page.locator(".site-footer form");
    await subscribe.locator('[name="email"]').fill("reader@example.com");
    await subscribe.locator('button[type="submit"]').click();
    await expect(subscribe.getByRole("status")).toContainText(subscribeSuccess);
    await subscribe.locator('[name="email"]').fill("another@example.com");
    await expect(subscribe.getByRole("status")).toBeEmpty();

    await page.goto(`${prefix}/subscription-preferences`);
    const preferences = page.locator("main form").first();
    await preferences.locator('[name="email"]').fill("reader@example.com");
    await preferences.locator('button[type="submit"]').click();
    await expect(preferences.getByRole("status")).toContainText(preferencesSuccess);
    await preferences.locator('[name="email"]').fill("another@example.com");
    await expect(preferences.getByRole("status")).toBeEmpty();
    await preferences.locator('button[type="submit"]').click();
    await expect(preferences.getByRole("status")).toContainText(preferencesSuccess);
    expect(preferencesKeys).toHaveLength(2);
    expect(preferencesKeys.every(Boolean)).toBe(true);
    expect(new Set(preferencesKeys).size).toBe(2);
  });
}

for (const [prefix, message] of [
  ["", "You are already subscribed to Modern Fundamental Analyst."],
  ["/zh-tw", "你已訂閱 Modern Fundamental Analyst。"],
  ["/zh-cn", "你已订阅 Modern Fundamental Analyst。"],
]) {
  test(`${prefix || "English"} duplicate subscription keeps input and clears feedback on editing`, async ({ page }) => {
    await page.route("**/api/subscribe", (route) =>
      route.fulfill({ status: 409, json: { error: "You've already subscribed" } }),
    );
    await page.goto(`${prefix}/contact`);
    const form = page.locator(".site-footer form");
    await form.locator('[name="email"]').fill("reader@example.com");
    await form.locator('button[type="submit"]').click();
    await expect(form.getByRole("status")).toHaveText(message!);
    await expect(form.locator('[name="email"]')).toHaveValue("reader@example.com");
    await form.locator('[name="email"]').fill("another@example.com");
    await expect(form.getByRole("status")).toBeEmpty();
  });
}
