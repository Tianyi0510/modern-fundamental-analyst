import { expect, test } from "@playwright/test";

for (const [prefix, width, back] of [
  ["", 1440, "View All Holdings"],
  ["/zh-tw", 834, "查看全部持股"],
  ["/zh-cn", 390, "查看全部持仓"],
] as const) {
  test(
    `holding detail matches its portfolio row at ${width}px`,
    width === 390 ? { tag: "@mobile" } : {},
    async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`${prefix}/portfolio`);
      const link = page.getByRole("link", { name: "BRK.B", exact: true });
      const row = page.getByRole("row").filter({ has: link });
      const shares = await row.locator("td").nth(0).innerText();
      const price = await row.locator("td").nth(1).innerText();
      const value = await row.locator("td").nth(3).innerText();
      await link.click();
      await expect(page).toHaveURL(`${prefix}/portfolio/brk.b`);
      await page.reload();
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("BRK.B");
      const research = page.getByRole("region", { name: /Company Fundamentals|公司基本面/ });
      await expect(research.getByRole("link", { name: /10-K/ })).toHaveAttribute(
        "href",
        /sec\.gov\/Archives\/edgar\/data\/1067983\//,
      );
      await expect(research).toContainText("371,444");
      const sicGaps = await research
        .locator("dl")
        .first()
        .evaluate((sic) => {
          const metrics = Array.from(sic.nextElementSibling!.children);
          const columns = getComputedStyle(sic.nextElementSibling!).gridTemplateColumns.split(" ").length;
          const labelTop = (item: Element) => item.querySelector("dt")!.getBoundingClientRect().top;
          const valueBottom = (item: Element) => item.querySelector("dd")!.getBoundingClientRect().bottom;
          return [
            labelTop(sic) - sic.previousElementSibling!.getBoundingClientRect().bottom,
            ...metrics.map((item, i) => labelTop(item) - valueBottom(i < columns ? sic : metrics[i - columns]!)),
          ];
        });
      for (const gap of sicGaps) expect(gap).toBeCloseTo(32, 1);
      for (const id of ["holding-research", "holding-history"]) {
        const gap = await page
          .locator(`#${id}`)
          .evaluate(
            (heading) =>
              heading.nextElementSibling!.getBoundingClientRect().top - heading.getBoundingClientRect().bottom,
          );
        expect(gap).toBeCloseTo(32, 1);
      }
      const intro = page.locator(".page-intro p");
      await expect(intro.locator("span")).toHaveCSS(
        "font-size",
        await intro.evaluate((el) => getComputedStyle(el).fontSize),
      );
      const disclosure = page.getByRole("button", { name: /View monthly positions|查看歷月明細|查看历月明细/ });
      await expect(
        research.getByRole("link", { name: /Investor relations|投資人關係官網|投资者关系官网/ }),
      ).toHaveAttribute("href", "https://www.berkshirehathaway.com/");
      const heading = await page.locator("#holding-history").boundingBox();
      await expect(disclosure).toHaveCount(0);
      const history = page.getByRole("table");
      await expect(history).toBeVisible();
      const table = await history.boundingBox();
      const researchTitle = await research.getByRole("heading").boundingBox();
      const researchCopy = await research
        .locator("p")
        .filter({ hasText: /Berkshire|波克夏|伯克希尔/ })
        .boundingBox();
      expect(heading && researchTitle && Math.abs(heading.x - researchTitle.x)).toBeLessThan(1);
      expect(table && researchCopy && Math.abs(table.x - researchCopy.x)).toBeLessThan(1);
      if (width > 1100) {
        expect(heading && table && Math.abs(heading.y - table.y)).toBeLessThan(1);
      } else {
        expect(heading && table && table.y > heading.y + heading.height).toBe(true);
      }
      await expect(page.getByText(/\d+ monthly records?|\d+ 筆月底紀錄|\d+ 条月末记录/)).toBeVisible();
      await expect(history.getByRole("rowheader").first()).toHaveCSS("font-weight", "400");
      const latest = page.locator("tbody tr").first();
      await expect(latest.locator("td")).toHaveText([shares, price, value]);
      const viewport = page.locator('[data-slot="table-container"]').filter({ has: history });
      expect(
        await viewport.evaluate((el) => {
          const note = document.getElementById("holding-history-note")!;
          return note.getBoundingClientRect().top >= el.getBoundingClientRect().bottom;
        }),
      ).toBe(true);
      await viewport.focus();
      await expect(viewport).toBeFocused();
      const scroll = await viewport.evaluate((el) => {
        const top = () => el.querySelector("thead")!.getBoundingClientRect().top - el.getBoundingClientRect().top;
        const before = top();
        const height = el.clientHeight;
        el.scrollTop = el.scrollHeight;
        return { offset: el.scrollTop, headerShift: Math.abs(top() - before), heightChange: el.clientHeight - height };
      });
      expect(scroll.offset).toBeGreaterThan(0);
      expect(scroll.headerShift).toBeLessThan(1);
      expect(scroll.heightChange).toBe(0);
      await expect(page.locator(".portfolio-kpis")).toContainText(value);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const backLink = page.locator(".page-hero").getByRole("link", { name: back, exact: true });
      expect(
        await backLink.evaluate((link) => {
          const title = link.closest("section")!.querySelector("h1")!.getBoundingClientRect();
          const action = link.getBoundingClientRect();
          return action.left >= title.right && Math.abs(action.top - title.top) < 1;
        }),
      ).toBe(true);
      await backLink.click();
      await expect(page).toHaveURL(`${prefix}/portfolio`);
    },
  );
}

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  test(`${prefix || "English"} every holding ticker stays intact and its action wraps only when needed @mobile`, async ({
    page,
  }) => {
    await page.goto(`${prefix}/portfolio`);
    const paths = await page
      .locator("th[scope=row] a")
      .evaluateAll((links) => links.map((link) => new URL((link as HTMLAnchorElement).href).pathname));
    expect(paths.length).toBeGreaterThan(0);
    for (const path of paths) {
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);
      for (const width of [320, 375, 390, 430]) {
        await page.setViewportSize({ width, height: 844 });
        const result = await page.locator(".page-hero h1").evaluate((h) => {
          const row = h.parentElement!.getBoundingClientRect();
          const action = h.nextElementSibling!.getBoundingClientRect();
          const title = h.getBoundingClientRect();
          const text = document.createRange();
          text.selectNodeContents(h.querySelector("em")!.firstChild!);
          return {
            lines: text.getClientRects().length,
            fits: title.width + 16 + action.width <= row.width + 0.01,
            sameRow: Math.abs(title.top - action.top) < 1 && Math.abs(row.right - action.right) < 1,
            nextRow: Math.abs(action.top - title.bottom - 16) < 1 && Math.abs(action.left - row.left) < 1,
            contained: title.right <= row.right + 1 && action.right <= row.right + 1,
          };
        });
        expect(result.lines, path).toBe(1);
        expect(result.contained, path).toBe(true);
        expect(result.fits ? result.sameRow : result.nextRow, path + " at " + width).toBe(true);
      }
    }
  });
}
