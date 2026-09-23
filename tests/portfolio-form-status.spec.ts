import { expect, test } from "@playwright/test";

const locales = [
  {
    prefix: "",
    name: "English",
    contactSuccess: "Your message has been sent.",
    subscribeSuccess: "You’re subscribed.",
    preferencesSuccess: "If this address is subscribed, a secure link is on its way.",
    returnNote: "Net dividends and financing interest are not allocated to positions",
  },
  {
    prefix: "/zh-tw",
    name: "Traditional Chinese",
    contactSuccess: "訊息已成功傳送",
    subscribeSuccess: "訂閱成功",
    preferencesSuccess: "若此地址已訂閱",
    returnNote: "淨股息與融資利息不分攤至各持股",
  },
  {
    prefix: "/zh-cn",
    name: "Simplified Chinese",
    contactSuccess: "信息已成功发送",
    subscribeSuccess: "订阅成功",
    preferencesSuccess: "如果此地址已订阅",
    returnNote: "净股息与融资利息不分摊至各持仓",
  },
] as const;

for (const { prefix, name, contactSuccess, subscribeSuccess, preferencesSuccess, returnNote } of locales) {
  test(`${name} portfolio total matches its summary`, async ({ page }) => {
    await page.goto(`${prefix}/portfolio`);
    const summaryReturn = page.locator('.portfolio-kpis [data-tone="brand"] strong');
    const tableReturn = page.locator(".portfolio-total-return");
    await expect(summaryReturn).toBeVisible();
    await expect(tableReturn).toHaveText((await summaryReturn.textContent()) ?? "");
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
    await contact.locator('[name="name"]').fill("Reader");
    await contact.locator('[name="email"]').fill("reader@example.com");
    await contact.locator('[name="subject"]').fill("First question");
    await contact.locator('[name="message"]').fill("A first question about the portfolio.");
    await contact.locator('button[type="submit"]').click();
    await expect(contact.locator('[role="status"]')).toContainText(contactSuccess);
    await contact.locator('[name="subject"]').fill("Second question");
    await expect(contact.locator('[role="status"]')).toBeEmpty();
    await contact.locator('[name="name"]').fill("Reader");
    await contact.locator('[name="email"]').fill("reader@example.com");
    await contact.locator('[name="message"]').fill("A second question about the portfolio.");
    await contact.locator('button[type="submit"]').click();
    await expect(contact.locator('[role="status"]')).toContainText(contactSuccess);
    expect(contactKeys).toHaveLength(2);
    expect(contactKeys.every(Boolean)).toBe(true);
    expect(new Set(contactKeys).size).toBe(2);

    const subscribe = page.locator(".site-footer form");
    await subscribe.locator('[name="email"]').fill("reader@example.com");
    await subscribe.locator('button[type="submit"]').click();
    await expect(subscribe.locator('[role="status"]')).toContainText(subscribeSuccess);
    await subscribe.locator('[name="email"]').fill("another@example.com");
    await expect(subscribe.locator('[role="status"]')).toBeEmpty();

    await page.goto(`${prefix}/subscription-preferences`);
    const preferences = page.locator("main form").first();
    await preferences.locator('[name="email"]').fill("reader@example.com");
    await preferences.locator('button[type="submit"]').click();
    await expect(preferences.locator('[role="status"]')).toContainText(preferencesSuccess);
    await preferences.locator('[name="email"]').fill("another@example.com");
    await expect(preferences.locator('[role="status"]')).toBeEmpty();
    await preferences.locator('button[type="submit"]').click();
    await expect(preferences.locator('[role="status"]')).toContainText(preferencesSuccess);
    expect(preferencesKeys).toHaveLength(2);
    expect(preferencesKeys.every(Boolean)).toBe(true);
    expect(new Set(preferencesKeys).size).toBe(2);
  });
}
