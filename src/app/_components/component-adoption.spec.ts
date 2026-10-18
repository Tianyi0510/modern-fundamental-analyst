import { expect, test } from "@playwright/test";

for (const text of [
  {
    prefix: "",
    appearance: "Appearance",
    light: "Light",
    clear: "Clear Message",
    keep: "Keep Editing",
    copy: "Copy Article Link",
    copied: "Article link copied.",
    close: "Close Notification",
  },
  {
    prefix: "/zh-tw",
    appearance: "外觀",
    light: "淺色",
    clear: "清除訊息",
    keep: "繼續編輯",
    copy: "複製文章連結",
    copied: "已複製文章連結。",
    close: "關閉通知",
  },
  {
    prefix: "/zh-cn",
    appearance: "外观",
    light: "浅色",
    clear: "清除信息",
    keep: "继续编辑",
    copy: "复制文章链接",
    copied: "已复制文章链接。",
    close: "关闭通知",
  },
]) {
  test(
    `${text.prefix || "English"} mobile appearance toggle and draft confirmation are functional`,
    { tag: "@mobile" },
    async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.emulateMedia({ colorScheme: "dark" });
      await page.goto(`${text.prefix}/contact`);
      await page.locator(".mobile-menu-button").click();
      const menu = page.getByRole("dialog");
      const appearance = menu.locator("[data-theme-toggle]");
      await appearance.click();
      await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
      await page.keyboard.press("Escape");
      await expect(menu).toBeHidden();
      const message = page.locator('textarea[name="message"]');
      await expect(page.getByRole("button", { name: text.clear, exact: true })).toBeDisabled();
      await message.fill("Keep this unsent research question.");
      const clear = page
        .locator("form")
        .filter({ has: message })
        .getByRole("button", { name: text.clear, exact: true });
      await clear.click();
      const dialog = page.getByRole("alertdialog");
      await expect(dialog).toHaveAccessibleName(/\S/);
      await dialog.getByRole("button", { name: text.keep, exact: true }).click();
      await expect(dialog).toBeHidden();
      await expect(message).toHaveValue("Keep this unsent research question.");
      await expect(clear).toBeFocused();
      await clear.click();
      await dialog.getByRole("button", { name: text.clear, exact: true }).click();
      await expect(dialog).toBeHidden();
      await expect(message).toHaveValue("");
      await expect(clear).toBeDisabled();
      await expect(message).toBeFocused();
      await page.reload();
      await expect(message).toHaveValue("");
      for (const width of [320, 390]) {
        await page.setViewportSize({ width, height: 900 });
        await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
        await message.fill("A draft for checking the confirmation layout.");
        await clear.click();
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
        await dialog.getByRole("button", { name: text.keep, exact: true }).click();
      }
    },
  );

  test(
    `${text.prefix || "English"} article copy uses a localized dismissible toast`,
    { tag: "@mobile" },
    async ({ page, baseURL }) => {
      await page.addInitScript(() => {
        Object.defineProperty(navigator, "clipboard", {
          configurable: true,
          value: {
            writeText: (value: string) => {
              document.documentElement.dataset.copiedArticle = value;
              return Promise.resolve();
            },
          },
        });
      });
      const path = `${text.prefix}/memos/microsoft-stock-analysis-fiscal-year-2024`;
      await page.goto(`${path}?preview=1#article`);
      await page.getByRole("button", { name: text.copy, exact: true }).click();
      await expect(page.locator("html")).toHaveAttribute("data-copied-article", `${baseURL}${path}`);
      await expect(page.getByText(text.copied, { exact: true })).toBeVisible();
      await page.keyboard.press("F6");
      await page.getByRole("button", { name: text.close, exact: true }).click();
      await expect(page.getByText(text.copied, { exact: true })).toBeHidden();
    },
  );
}

test("desktop navigation retains real links and current-page semantics", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const navigation = page.getByRole("navigation", { name: "Primary navigation" });
  await expect(navigation.getByRole("link", { name: "Home", exact: true })).toHaveAttribute("aria-current", "page");
  const portfolio = navigation.getByRole("link", { name: "Portfolio", exact: true });
  await portfolio.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL("/portfolio");
  await expect(portfolio).toHaveAttribute("aria-current", "page");
});
