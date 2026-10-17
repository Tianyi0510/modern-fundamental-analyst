import { expect, test } from "@playwright/test";
import { colorContrast } from "../../scripts/color-contrast";

test.beforeEach(async ({ context, baseURL }) => {
  // Context routing also covers recorder requests that outlive a document during navigation.
  // Credentialed keepalive requests require an explicit origin, including in WebKit mocks.
  await context.route("https://sentry.invalid/**", (route) =>
    route.fulfill({
      status: 200,
      body: "{}",
      headers: {
        "Access-Control-Allow-Origin": new URL(baseURL!).origin,
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Headers": "Content-Type, Sentry-Trace, Baggage",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    }),
  );
});

const labels = [
  { prefix: "", label: "Appearance" },
  { prefix: "/zh-tw", label: "外觀" },
  { prefix: "/zh-cn", label: "外观" },
];
for (const { prefix, label } of labels) {
  test(`${prefix || "English"} theme persists and follows system preference @mobile`, async ({
    page,
    browserName,
  }, testInfo) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    await page.emulateMedia({ colorScheme: "dark" });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`${prefix}/contact`);
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    const appearance = page.getByRole("combobox", { name: label });
    await expect(appearance).toHaveValue("system");
    await expect(page.locator("body")).toHaveCSS("background-color", "rgb(0, 0, 0)");
    await expect(page.locator("body")).toHaveCSS("color", "rgb(255, 255, 255)");
    const language = page.locator(".language-trigger");
    await language.focus();
    await page.keyboard.press("Enter");
    await page.keyboard.press("Tab");
    await expect(appearance).toBeFocused();
    for (const width of [1151, 1280, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      const logo = await page.locator("header .wordmark").boundingBox();
      const adjacent = page.locator(width < 1280 ? ".mobile-menu-button" : ".header-actions nav a").first();
      const actions = await adjacent.boundingBox();
      expect(logo).not.toBeNull();
      expect(actions).not.toBeNull();
      expect(actions!.x, `Header overlap at ${width}px`).toBeGreaterThanOrEqual(logo!.x + logo!.width);
    }
    await appearance.selectOption("light");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect(page.locator("body")).toHaveCSS("background-color", "rgb(255, 255, 255)");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await page.getByRole("combobox", { name: label }).selectOption("dark");
    for (const route of [
      "",
      "/about",
      "/portfolio",
      "/performance",
      "/memos",
      "/contact",
      "/support",
      "/disclaimer",
      "/subscription-preferences",
      "/memos/microsoft-stock-analysis-fiscal-year-2024",
    ]) {
      await page.goto(`${prefix}${route}` || "/");
      await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
      await expect(page.locator("body")).toHaveCSS("background-color", "rgb(0, 0, 0)");
      const samples = await page
        .locator("main h1, main h2, main p, .portfolio-row td, .portfolio-kpis small, .metric small")
        .evaluateAll((elements) =>
          elements
            .filter((e) => e.checkVisibility())
            .map((e) => {
              const s = getComputedStyle(e);
              const normalize = (color: string) => {
                const canvas = document.createElement("canvas");
                canvas.width = canvas.height = 1;
                const context = canvas.getContext("2d")!;
                context.fillStyle = color;
                context.fillRect(0, 0, 1, 1);
                const [r = 0, g = 0, b = 0, a = 255] = context.getImageData(0, 0, 1, 1).data;
                return `rgba(${r}, ${g}, ${b}, ${a / 255})`;
              };
              let parent: Element | null = e;
              let background = "";
              while (parent) {
                const bg = getComputedStyle(parent).backgroundColor;
                if (bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
                  background = bg;
                  break;
                }
                parent = parent.parentElement;
              }
              return {
                text: e.textContent?.slice(0, 35),
                color: normalize(s.color),
                background: normalize(background),
                opacity: Number(s.opacity),
              };
            }),
        );
      for (const sample of samples)
        expect(
          colorContrast(sample.color, sample.background, sample.opacity),
          JSON.stringify(sample),
        ).toBeGreaterThanOrEqual(4.5);
      await expect(page.locator("header .wordmark img:visible")).toHaveAttribute("src", "/logo-wordmark-inverse.svg");
      if (!prefix && !route && browserName === "chromium") {
        await page.screenshot({ path: testInfo.outputPath("home-dark.png"), fullPage: true });
        await page.getByRole("combobox", { name: label }).selectOption("light");
        await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
        await page.screenshot({ path: testInfo.outputPath("home-light.png"), fullPage: true });
        await page.getByRole("combobox", { name: label }).selectOption("dark");
      }
      for (const width of [320, 390, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          `${route} at ${width}px`,
        ).toBe(true);
      }
      await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    if (!prefix) {
      await page.goto("/zh-tw/contact");
      await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
      await expect(page.getByRole("combobox", { name: "外觀" })).toHaveValue("dark");
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${prefix}/contact`);
    await page.locator(".mobile-menu-button").click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(page.locator(".mobile-menu-layer")).toHaveAttribute("data-menu-phase", "open");
    await expect(page.locator(".mobile-menu-close")).toHaveCSS("color", "rgb(0, 0, 0)");
    if (!prefix && browserName === "chromium") await page.screenshot({ path: testInfo.outputPath("menu-dark.png") });
    await dialog.getByRole("combobox", { name: label }).selectOption("system");
    await page.emulateMedia({ colorScheme: "light" });
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await page.emulateMedia({ colorScheme: "dark" });
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(page.locator(".mobile-menu-button")).toBeFocused();
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(page.getByRole("combobox", { name: label })).toHaveCount(0);
    expect(pageErrors).toEqual([]);
  });
}

test("system appearance works without JavaScript @mobile", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false, colorScheme: "dark" });
  try {
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.locator("body")).toHaveCSS("background-color", "rgb(0, 0, 0)");
    await expect(page.locator("header .wordmark img:visible")).toHaveAttribute("src", "/logo-wordmark-inverse.svg");
    await page.emulateMedia({ colorScheme: "light" });
    await expect(page.locator("body")).toHaveCSS("background-color", "rgb(255, 255, 255)");
    await expect(page.locator("header .wordmark img:visible")).toHaveAttribute("src", "/logo-wordmark.svg");
  } finally {
    await context.close();
  }
});

test("a native appearance choice made before hydration persists", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  let release!: () => void;
  const scriptsReady = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/_next/static/chunks/*.js", async (route) => {
    await scriptsReady;
    await route.continue();
  });
  try {
    await page.goto("/contact", { waitUntil: "domcontentloaded" });
    await page.getByRole("combobox", { name: "Appearance" }).selectOption("dark");
  } finally {
    release();
  }
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.getByRole("combobox", { name: "Appearance" })).toHaveValue("dark");
});

test("isolated monitoring transport accepts credentialed keepalive requests @mobile", async ({ page }) => {
  await page.goto("/contact");
  expect(
    await page.evaluate(async () => {
      const response = await fetch("https://sentry.invalid/cors-probe", {
        method: "POST",
        body: "{}",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        keepalive: true,
      });
      return response.ok;
    }),
  ).toBe(true);
});

test("monitoring requests remain intercepted after their document navigates @mobile", async ({ page, context }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  let started = false;
  let completed = false;
  let release!: () => void;
  const responseReady = new Promise<void>((resolve) => {
    release = resolve;
  });
  const endpoint = "https://sentry.invalid/navigation-probe";
  await context.route(endpoint, async (route) => {
    started = true;
    await responseReady;
    await route.fallback();
    completed = true;
  });
  try {
    await page.goto("/contact");
    await page.evaluate((url) => {
      void fetch(url, { method: "POST", body: "{}", credentials: "include", keepalive: true }).catch(() => {});
    }, endpoint);
    await expect.poll(() => started).toBe(true);
    await page.goto("/about", { waitUntil: "domcontentloaded" });
    release();
    await expect.poll(() => completed).toBe(true);
    expect(errors).toEqual([]);
  } finally {
    release();
  }
});
