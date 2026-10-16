import { expect, test } from "@playwright/test";

const cases = [
  {
    prefix: "",
    payment: "Payment status has not been verified",
    legal: [
      /loss of principal/,
      /forward-looking statements/,
      /professional relationship/,
      /without Warranties/i,
      /cannot lawfully be excluded/,
    ],
    boundary: "separate brokerage fund-account positions",
    included: "Listed ETFs in the stock ledger, including VGT and GRNY, remain included",
    memoNotice: null,
  },
  {
    prefix: "/zh-tw",
    payment: "付款狀態尚未確認",
    legal: [/損失本金/, /前瞻性陳述/, /專業關係/, /不附帶保證/, /依法不得排除或限制/],
    boundary: "獨立基金帳戶持倉",
    included: "股票交易紀錄內的上市 ETF（包括 VGT 與 GRNY）仍納入計算",
    memoNotice: "本文目前僅提供英文原文，尚無中文譯文。",
  },
  {
    prefix: "/zh-cn",
    payment: "付款状态尚未确认",
    legal: [/损失本金/, /前瞻性陈述/, /专业关系/, /不附带保证/, /依法不得排除或限制/],
    boundary: "独立基金账户持仓",
    included: "股票交易记录内的上市 ETF（包括 VGT 与 GRNY）仍纳入计算",
    memoNotice: "本文目前仅提供英文原文，尚无中文译文。",
  },
];

for (const copy of cases) {
  test(`${copy.prefix || "English"} disclosures match payment evidence, calculation scope and article language`, async ({
    page,
  }) => {
    await page.goto(`${copy.prefix}/support?status=cancelled`);
    await expect(page.locator(".support-status")).toContainText(copy.payment);
    await expect(page.locator(".support-status-success")).toHaveCount(0);

    await page.goto(`${copy.prefix}/disclaimer`);
    for (const disclosure of copy.legal) await expect(page.getByRole("main")).toContainText(disclosure);

    await page.goto(`${copy.prefix}/performance`);
    const methodology = page.locator(".methodology-explanation");
    await expect(methodology).toContainText(copy.boundary);
    await expect(methodology).toContainText(copy.included);
    await expect(methodology.locator("p > strong")).toHaveCount(4);

    await page.goto(`${copy.prefix}/memos/microsoft-stock-analysis-fiscal-year-2024`);
    await expect(page.getByRole("heading", { name: /Research Scope|研究範圍|研究范围/ })).toHaveCount(0);
    const disclaimer = page.getByRole("complementary", { name: /Disclaimer|免責聲明|免责声明/ });
    await expect(disclaimer).toContainText("DCF");
    expect(
      await disclaimer.evaluate((element) => Boolean(element.previousElementSibling?.matches(".article-body"))),
    ).toBe(true);
    await expect(page.locator(".article-meta time")).toHaveAttribute("datetime", "2025-10-10");
    await expect(page.locator(".memo-references a")).toHaveCount(5);
    for (const link of await page.locator(".memo-references a").all()) {
      await expect(link).toHaveAttribute("href", /^https:\/\//);
      await expect(link).toHaveText("Read Source");
    }
    await expect(page.locator(".article-body")).toHaveAttribute("lang", "en");
    if (copy.memoNotice) await expect(page.getByRole("article")).toContainText(copy.memoNotice);
    else await expect(page.getByRole("article")).not.toContainText("no translation is available");
    const data = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(
      data.some((value) => {
        const article: unknown = JSON.parse(value);
        return (
          typeof article === "object" &&
          article !== null &&
          "@type" in article &&
          article["@type"] === "Article" &&
          "inLanguage" in article &&
          article.inLanguage === "en"
        );
      }),
    ).toBe(true);
  });
}

for (const prefix of ["/zh-tw", "/zh-cn"]) {
  test(
    `${prefix} article language notice aligns with the body and remains separated from its heading`,
    { tag: "@mobile" },
    async ({ page }, testInfo) => {
      await page.goto(`${prefix}/memos/microsoft-stock-analysis-fiscal-year-2024`);
      const widths = testInfo.project.name === "webkit" ? [390, 320] : [1440, 390, 320];
      for (const width of widths) {
        await page.setViewportSize({ width, height: 900 });
        const notice = page.locator(".memo-language-notice");
        const body = page.locator(".article-body");
        await expect(notice).toBeVisible();
        const [noticeBox, bodyBox] = await Promise.all([notice.boundingBox(), body.boundingBox()]);
        expect(noticeBox!.x).toBeCloseTo(bodyBox!.x, 0);
        expect(noticeBox!.width).toBeCloseTo(bodyBox!.width, 0);
        expect(bodyBox!.y - noticeBox!.y - noticeBox!.height).toBeGreaterThanOrEqual(width <= 800 ? 39 : 55);
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      }
    },
  );
}
