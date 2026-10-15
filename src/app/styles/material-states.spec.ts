import { expect, test, type Locator } from "@playwright/test";
import { colorContrast } from "../../../scripts/color-contrast";

async function colors(control: Locator) {
  return control.evaluate((element) => {
    const style = getComputedStyle(element);
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const context = canvas.getContext("2d")!;
    function rgb(value: string) {
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = value;
      context.fillRect(0, 0, 1, 1);
      const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
      return `rgb(${r}, ${g}, ${b})`;
    }
    return { text: rgb(style.color), surface: rgb(style.backgroundColor) };
  });
}

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  test(`${prefix || "English"} primary actions use one accessible state layer`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`${prefix}/contact`);
    const submit = page.locator(".contact-submit");
    await expect(submit).toHaveCSS("background-color", "rgb(0, 41, 145)");
    await submit.hover();
    await expect.poll(async () => (await colors(submit)).surface).toBe("rgb(20, 58, 154)");
    await page.keyboard.press("Tab");
    await submit.focus();
    await expect.poll(async () => (await colors(submit)).surface).toBe("rgb(26, 62, 156)");
    await expect(submit).toHaveCSS("outline-style", "solid");
    const sample = await colors(submit);
    expect(colorContrast(sample.text, sample.surface)).toBeGreaterThanOrEqual(4.5);
    await submit.evaluate((element) =>
      element.addEventListener("click", (event) => event.preventDefault(), { once: true }),
    );
    await page.keyboard.down("Space");
    try {
      await expect.poll(async () => (await colors(submit)).surface).toBe("rgb(26, 62, 156)");
    } finally {
      await page.keyboard.up("Space");
    }
    await expect(submit).toBeEnabled();
  });

  test(
    `${prefix || "English"} cards and payment choices expose selection and focus`,
    { tag: "@mobile" },
    async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(`${prefix}/memos`);
      const card = page.locator("a.memo-card").first();
      await expect(card).toHaveCSS("border-radius", "16px");
      await card.focus();
      await expect(card).toHaveCSS("outline-style", "solid");
      await expect(card).toHaveCSS("color", "rgb(0, 41, 145)");
      await page.goto(`${prefix}/support`);
      const options = page.locator(".support-amount-option");
      await expect(options).toHaveCount(3);
      const radio = options.first().locator('input[type="radio"]');
      await options.first().click();
      await expect(radio).toBeChecked();
      await page.keyboard.press("Tab");
      await radio.focus();
      await expect(radio).toBeFocused();
      await expect(options.first()).toHaveCSS("outline-style", "solid");
      await expect(options.first()).toHaveCSS("outline-color", "rgb(95, 205, 253)");
      await expect(options.first()).toHaveCSS("background-color", "rgb(0, 41, 145)");
      const sample = await colors(options.first());
      expect(colorContrast(sample.text, sample.surface)).toBeGreaterThanOrEqual(4.5);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    },
  );
}
