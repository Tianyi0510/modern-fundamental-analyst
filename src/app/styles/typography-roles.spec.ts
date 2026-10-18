import { expect, test, type Page } from "@playwright/test";
import { colorContrast } from "../../../scripts/color-contrast";

// Independent expectations from the approved Perfect Fourth specification.
const treatments = {
  largeDisplay: [51, 67, 90, 1.15, 700],
  mediumDisplay: [51, 51, 67, 1.15, 700],
  summaryDisplay: [51, 51, 51, 1.15, 700],
  smallDisplay: [38, 38, 38, 1.15, 700],
  largeHeadline: [38, 51, 67, 1.15, 700],
  mediumHeadline: [38, 51, 51, 1.15, 700],
  smallHeadline: [28, 38, 38, 1.15, 700],
  largeTitle: [28, 28, 28, 1.15, 700],
  mediumTitle: [21, 21, 21, 1.15, 700],
  largeLabel: [16, 16, 16, 1.5, 700],
  mediumLabel: [16, 16, 16, 1.5, 400],
  largeBody: [21, 21, 21, 1.5, 400],
  mediumBody: [16, 16, 16, 1.5, 400],
  smallBody: [16, 16, 16, 1.5, 400],
} as const;
type Role = keyof typeof treatments;
const routeRoles: Record<string, Partial<Record<Role, string[]>>> = {
  "/": {
    largeDisplay: [".hero h1", ".performance-value strong"],
    summaryDisplay: [".metric strong"],
    smallDisplay: [".allocation-ring > span"],
    largeHeadline: [".home-about h2", ".intro h2", ".section-heading h2", ".cta h2"],
    largeTitle: [".memo-card h3"],
    mediumTitle: [".footer-heading", ".holding-row strong", ".holding-row b"],
    largeBody: [".hero-bottom > p", ".home-about > div:last-child p", ".performance-copy p"],
    smallBody: [".memo-card [data-slot=card-description]", ".metric small", ".footer-bottom small"],
    largeLabel: [".eyebrow", ".metric > dt", ".hero-actions .button", ".text-link"],
    mediumLabel: [".header-actions nav a"],
  },
  "/about": {
    largeHeadline: [".page-hero h1"],
    smallHeadline: [".about-section-heading h2", ".about-closing h2"],
    mediumTitle: [".about-boundaries h2"],
    mediumBody: [".about-copy", ".about-boundaries ol"],
  },
  "/portfolio": {
    largeHeadline: [".page-hero h1"],
    smallHeadline: [".portfolio-holdings-heading h2"],
    summaryDisplay: [".portfolio-kpis strong"],
    smallBody: ["tbody .portfolio-row > td"],
    largeLabel: [".portfolio-row > th", ".portfolio-total-row > td"],
  },
  "/performance": {
    largeHeadline: [".page-hero h1"],
    smallHeadline: [".returns .section-heading h2", ".methodology h2"],
    summaryDisplay: [".performance-summary strong"],
    mediumTitle: ["#performance-twr-chart-title", "#performance-chart-title"],
  },
  "/memos": { largeHeadline: [".page-hero h1"], largeTitle: [".memo-card h2", ".memo-index-row h2"] },
  "/contact": {
    largeHeadline: [".page-hero h1"],
    largeTitle: ["#contact-subscribe-title", "#contact-form-title"],
    largeLabel: ["form .button"],
  },
  "/support": {
    largeHeadline: [".page-hero h1"],
    largeTitle: [".support-section h2"],
    mediumDisplay: [".support-amount-option strong"],
  },
  "/disclaimer": {
    mediumHeadline: [".legal h1"],
    smallHeadline: [".legal-section h2"],
    mediumBody: [".legal-section-copy p"],
  },
  "/subscription-preferences": { largeHeadline: ["main h1"] },
  "/subscription-confirmation": { mediumTitle: ["main h1"] },
  "/memos/microsoft-stock-analysis-fiscal-year-2024": {
    largeDisplay: [".memo-article h1"],
    smallHeadline: [".article-body h2"],
    mediumTitle: [".memo-subsection h3"],
    mediumBody: [".article-body"],
  },
};

const viewports = [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "tablet-boundary", width: 801, height: 1000 },
  { name: "mobile", width: 390, height: 844 },
] as const;

for (const [prefix, fallback] of [
  ["", null],
  ["/zh-tw", "Noto Sans TC"],
  ["/zh-cn", "Noto Sans SC"],
] as const) {
  test((prefix || "English") + " uses Jost before its locale fallback", async ({ page }) => {
    await page.goto(prefix || "/");
    const fontFamily = await page.locator("body").evaluate((element) => getComputedStyle(element).fontFamily);
    const families = fontFamily
      .replaceAll('"', "")
      .split(",")
      .map((family) => family.trim());
    expect(families[0]).toBe("Jost");
    if (fallback) {
      expect(families).toContain(fallback);
      expect(families.indexOf("Jost")).toBeLessThan(families.indexOf(fallback));
    }
  });
}

for (const viewport of [viewports[0], viewports[2]]) {
  test(
    viewport.name + " editorial surfaces retain their computed colors",
    viewport.name === "mobile" ? { tag: "@mobile" } : {},
    async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto("/");
      await expect(page.locator(".site-footer")).toHaveCSS("background-color", "rgb(0, 0, 0)");
      await expect(page.locator(".site-footer")).toHaveCSS("color", "rgb(255, 255, 255)");
      await expect(page.locator(".performance-home")).toHaveCSS("background-color", "rgb(255, 255, 255)");
      await expect(page.locator(".performance-home")).toHaveCSS("color", "rgb(0, 0, 0)");

      await page.goto("/about");
      await expect(page.locator(".about-boundaries > section").first()).toHaveCSS("background-color", "rgb(0, 0, 0)");
      await expect(page.locator(".about-boundaries > section").first()).toHaveCSS("color", "rgb(255, 255, 255)");
      await expect(page.locator(".about-boundaries > section").last()).toHaveCSS(
        "background-color",
        "rgb(125, 203, 250)",
      );
      await expect(page.locator(".about-boundaries > section").last()).toHaveCSS("color", "rgb(0, 0, 0)");

      await page.goto("/contact");
      await expect(page.locator(".contact-band")).toHaveCSS("background-color", "rgb(125, 203, 250)");
      await expect(page.locator(".contact-section")).toHaveCSS("color", "rgb(0, 0, 0)");
      await expect(page.locator("#contact-subscribe")).toHaveCSS("color", "rgb(0, 0, 0)");
      await expect(page.locator("#contact-subscribe-title")).toBeVisible();
    },
  );
}

function expectedSize(role: Role, width: number) {
  return treatments[role][width < 800 ? 0 : width < 1200 ? 1 : 2];
}
function expectedRhythm(role: Role) {
  return { lineHeight: treatments[role][3], trackingEm: 0 };
}

async function invalidTreatments(page: Page) {
  return page.locator("body").evaluate((body) => {
    const root = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
    return [...body.querySelectorAll("*")].flatMap((element) => {
      const rect = element.getBoundingClientRect();
      if (
        !rect.width ||
        !rect.height ||
        ![...element.childNodes].some((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim())
      )
        return [];
      const style = getComputedStyle(element);
      const size = Number.parseFloat(style.fontSize);
      const leading = Number.parseFloat(style.lineHeight) / size;
      const weight = Number(style.fontWeight);
      const tracking = style.letterSpacing === "normal" ? 0 : Number.parseFloat(style.letterSpacing);
      const normalized = (size / root) * 16;
      const valid =
        [16, 21, 28, 38, 51, 67, 90].some((value) => Math.abs(value - normalized) < 0.1) &&
        [400, 700].includes(weight) &&
        Math.abs(tracking) < 0.01 &&
        [1.15, 1.5].some((value) => Math.abs(value - leading) < 0.01);
      return valid
        ? []
        : [{ text: element.textContent?.trim().slice(0, 60), tag: element.tagName, size, leading, weight, tracking }];
    });
  });
}

type TypographySample = {
  selector: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  weight: number;
  family: string;
  language: string;
};

async function readTypography(page: Page, roles: Partial<Record<Role, string[]>>) {
  // Sample the whole page in one browser round trip, retaining every selector.
  const groups = await page.evaluate(
    (entries) =>
      entries.map(([role, selectors]) => ({
        role,
        samples: selectors.map((selector) => ({
          selector,
          values: [...document.querySelectorAll(selector)].map((element) => {
            const style = getComputedStyle(element);
            return {
              selector,
              fontSize: Number.parseFloat(style.fontSize),
              lineHeight: Number.parseFloat(style.lineHeight),
              letterSpacing: style.letterSpacing === "normal" ? 0 : Number.parseFloat(style.letterSpacing),
              weight: Number(style.fontWeight),
              family: style.fontFamily,
              language: element.closest("[lang]")?.getAttribute("lang") ?? "en",
            };
          }),
        })),
      })),
    Object.entries(roles) as Array<[Role, string[]]>,
  );
  return groups.map(({ role, samples }) => {
    for (const { selector, values } of samples) {
      expect(values.length, `Missing typography sample: ${selector}`).toBeGreaterThan(0);
    }
    return { role, values: samples.flatMap(({ values }) => values) };
  });
}

for (const viewport of viewports) {
  test.describe(`${viewport.name} typography at ${viewport.width}px`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    for (const prefix of ["", "/zh-tw", "/zh-cn"])
      test(
        `${prefix || "English"} each semantic role resolves to one computed type treatment`,
        viewport.name === "mobile" ? { tag: "@mobile" } : {},
        async ({ page }) => {
          const observed = new Map<Role, TypographySample[]>();

          for (const [route, roles] of Object.entries(routeRoles)) {
            await page.goto(`${prefix}${route === "/" ? "" : route}` || "/");
            expect(
              await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
              `${route} has horizontal overflow at ${viewport.width}px`,
            ).toBe(true);
            expect(
              await invalidTreatments(page),
              `${prefix}${route} must use the approved Perfect Fourth scale`,
            ).toEqual([]);
            for (const { role, values } of await readTypography(page, roles)) {
              observed.set(role, [...(observed.get(role) ?? []), ...values]);
            }
          }

          for (const [role, values] of observed) {
            const expectedFontSize = expectedSize(role, viewport.width);

            for (const sample of values) {
              const rhythm = expectedRhythm(role);
              expect
                .soft(
                  Math.abs(sample.fontSize - expectedFontSize),
                  `${role} sample ${sample.selector} resolved to ${sample.fontSize}px instead of ${expectedFontSize}px`,
                )
                .toBeLessThan(0.15);
              expect
                .soft(
                  Math.abs(sample.lineHeight - sample.fontSize * rhythm.lineHeight),
                  `${role} sample ${sample.selector} has an inconsistent line height`,
                )
                .toBeLessThan(0.2);
              expect
                .soft(
                  Math.abs(sample.letterSpacing - sample.fontSize * rhythm.trackingEm),
                  `${role} sample ${sample.selector} has inconsistent letter spacing`,
                )
                .toBeLessThan(0.2);
              expect.soft(sample.family.split(",")[0]!.replaceAll('"', "").trim()).toBe("Jost");
              expect.soft(sample.weight, `${role} sample ${sample.selector} weight`).toBe(treatments[role][4]);
            }
            expect
              .soft(
                new Set(values.map(({ fontSize }) => fontSize.toFixed(2))).size,
                `${role} has multiple computed sizes`,
              )
              .toBe(1);
          }
        },
      );
  });
}

test.describe("form accessibility and preserved text colors", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
    test(
      `${prefix || "English"} fields retain color and visible focus with larger text`,
      { tag: "@mobile" },
      async ({ page }) => {
        await page.goto(`${prefix}/contact`);
        const contactEmail = page
          .locator("form[action], form")
          .filter({ has: page.locator("textarea") })
          .locator('input[name="email"]');
        await contactEmail.click();
        await expect(contactEmail).toBeFocused();
        await expect(contactEmail).toHaveCSS("color", "rgb(0, 0, 0)");
        await expect(contactEmail).toHaveCSS("outline-style", "solid");
        await expect(contactEmail).toHaveCSS("outline-color", "rgb(13, 40, 139)");
        const footerEmail = page.locator('.site-footer input[name="email"]');
        await footerEmail.click();
        await expect(footerEmail).toBeFocused();
        await expect(footerEmail).toHaveCSS("color", "rgb(255, 255, 255)");
        await expect(footerEmail).toHaveCSS("outline-color", "rgb(125, 203, 250)");
        await page.evaluate(() => {
          document.documentElement.style.fontSize = "200%";
        });
        await expect(contactEmail).toHaveCSS("font-size", "32px");
        const overflow = await page.evaluate(() =>
          [...document.querySelectorAll("body *")]
            .filter((element) => element.getBoundingClientRect().right > window.innerWidth + 1)
            .map((element) => ({
              tag: element.tagName,
              className: element.className,
              right: element.getBoundingClientRect().right,
            }))
            .slice(0, 15),
        );
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
          JSON.stringify(overflow),
        ).toBe(true);
        for (const field of [contactEmail, footerEmail]) {
          const box = await field.boundingBox();
          expect(box).not.toBeNull();
          expect(box!.x).toBeGreaterThanOrEqual(0);
          expect(box!.x + box!.width).toBeLessThanOrEqual(390);
        }
        await page.goto(`${prefix}/subscription-preferences`);
        const preferenceEmail = page.locator('main input[name="email"]').first();
        await preferenceEmail.click();
        await expect(preferenceEmail).toBeFocused();
        await expect(preferenceEmail).toHaveCSS("color", "rgb(0, 0, 0)");
        await expect(preferenceEmail).toHaveCSS("outline-color", "rgb(13, 40, 139)");
      },
    );
  }

  test("KPI treatments preserve colors after card reordering", { tag: "@mobile" }, async ({ page }) => {
    for (const route of ["/", "/portfolio", "/performance"]) {
      await page.goto(route);
      const cards = page.locator("[data-tone]");
      const before = await cards.evaluateAll((elements) =>
        elements.map((element) => ({
          tone: element.getAttribute("data-tone"),
          color: getComputedStyle(element).color,
          background: getComputedStyle(element).backgroundColor,
        })),
      );
      const expected: Record<string, [string, string]> = {
        plain: ["rgb(0, 0, 0)", "rgb(255, 255, 255)"],
        highlight: ["rgb(13, 40, 139)", "rgb(125, 203, 250)"],
        brand: ["rgb(125, 203, 250)", "rgb(13, 40, 139)"],
        paper: ["rgb(13, 40, 139)", "rgb(255, 255, 255)"],
      };
      for (const sample of before) expect([sample.color, sample.background]).toEqual(expected[sample.tone!]);
      const after = await cards.evaluateAll((elements) => {
        // Preserve identity across multiple KPI groups; each parent reorders its own cards.
        const originalOrder = [...elements];
        elements.reverse().forEach((element) => element.parentElement!.appendChild(element));
        return originalOrder.map((element) => ({
          tone: element.getAttribute("data-tone"),
          color: getComputedStyle(element).color,
          background: getComputedStyle(element).backgroundColor,
        }));
      });
      expect(after).toEqual(before);
    }
  });

  test("reduced motion removes button scaling", { tag: "@mobile" }, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/contact");
    const button = page
      .locator("form")
      .filter({ has: page.locator("textarea") })
      .locator('button[type="submit"]');
    await button.focus();
    expect(
      await button.evaluate((element) => {
        const transform = getComputedStyle(element).transform;
        return transform === "none" || new DOMMatrix(transform).isIdentity;
      }),
    ).toBe(true);
    const durations = await button.evaluate((element) =>
      getComputedStyle(element)
        .transitionDuration.split(",")
        .map((value) => Number.parseFloat(value)),
    );
    for (const duration of durations) expect(duration).toBeCloseTo(0.00001, 8);
    await page.goto("/");
    const arrow = page.locator(".home-page .text-link .arrow-icon").first();
    await arrow.locator("..").hover();
    await expect(arrow).toHaveCSS("transform", "none");
    await page.setViewportSize({ width: 390, height: 800 });
    await page.locator(".mobile-menu-button").click();
    await expect(page.locator(".mobile-menu-close-icon")).toHaveCSS("transform", "none");
    await expect(page.locator(".mobile-menu-drawer nav a").first()).toHaveCSS("translate", "none");
  });

  test("forced colors retains a visible field outline", async ({ page, browserName }) => {
    test.skip(browserName === "webkit", "WebKit does not emulate forced colors");
    await page.emulateMedia({ forcedColors: "active" });
    await page.goto("/contact");
    const field = page.locator('input[name="email"]').first();
    await field.click();
    await expect(field).toBeFocused();
    await expect(field).toHaveCSS("outline-style", "solid");
    await expect(field).toHaveCSS("outline-width", "2px");
    const colors = await field.evaluate((element) => ({
      outline: getComputedStyle(element).outlineColor,
      background: getComputedStyle(element).backgroundColor,
    }));
    expect(colors.outline).not.toBe(colors.background);
  });
});

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  for (const width of [320, 390]) {
    test(
      `${prefix || "English"} content reflows at 200% text size at ${width}px`,
      { tag: "@mobile" },
      async ({ page }) => {
        await page.setViewportSize({ width, height: 800 });
        for (const route of [
          "/",
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
          const path = `${prefix}${route === "/" ? "" : route}` || "/";
          await page.goto(path);
          await page.evaluate(() => document.fonts.ready);
          await page.addStyleTag({ content: "html { font-size: 200%; }" });
          if (route === "/memos") {
            await page.locator(".memo-disclosure > [data-slot=collapsible-trigger]").click();
            await expect(page.locator(".memo-index-row").first()).toBeVisible();
          }
          const overflow = await page.locator("body").evaluate((body) =>
            [...body.querySelectorAll("*")]
              .filter((element) => element.getBoundingClientRect().right > innerWidth + 1)
              .map((element) => ({
                tag: element.tagName,
                className: element.className,
                text: element.textContent?.slice(0, 80),
                right: element.getBoundingClientRect().right,
              }))
              .slice(-15),
          );
          expect(
            await page.evaluate(() => document.documentElement.scrollWidth),
            `${path} overflows at ${width}px with enlarged text: ${JSON.stringify(overflow)}`,
          ).toBeLessThanOrEqual(width);
          if (route === "/") {
            const clipped = await page
              .locator(".metric strong, .performance-value strong, .holding-row")
              .evaluateAll((elements) =>
                elements
                  .filter((element) => element.scrollWidth > element.clientWidth + 1)
                  .map((element) => ({
                    text: element.textContent?.trim(),
                    scrollWidth: element.scrollWidth,
                    clientWidth: element.clientWidth,
                  })),
              );
            expect(clipped, `${path} clips enlarged financial values`).toEqual([]);
          }
        }
      },
    );
  }
}

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  for (const width of [390, 1440]) {
    test(
      `${prefix || "English"} interaction text has readable contrast at ${width}px`,
      width === 390 ? { tag: "@mobile" } : {},
      async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(prefix || "/");
        let controls;
        if (width === 390) {
          await page.locator(".mobile-menu-button").click();
          await expect(page.locator('[data-menu-phase="open"]')).toBeVisible();
          const logo = page.locator(".mobile-menu-wordmark .brand-logo");
          await expect(logo).toHaveText("Modern Fundamental Analyst.");
          controls = page.locator('.mobile-menu-drawer nav a[aria-current="page"]');
        } else {
          controls = page.locator('.header-actions nav a[aria-current="page"]');
        }
        await expect(controls).toHaveCSS("color", "rgb(13, 40, 139)");
        const readContrast = () =>
          controls.evaluate((element) => {
            const canvas = document.createElement("canvas");
            canvas.width = canvas.height = 1;
            const context = canvas.getContext("2d")!;
            const rgb = () => `rgb(${[...context.getImageData(0, 0, 1, 1).data].slice(0, 3).join(", ")})`;
            context.fillStyle = "white";
            context.fillRect(0, 0, 1, 1);
            const ancestors = [];
            for (let current: Element | null = element; current; current = current.parentElement)
              ancestors.push(current);
            for (const ancestor of ancestors.reverse()) {
              context.fillStyle = getComputedStyle(ancestor).backgroundColor;
              context.fillRect(0, 0, 1, 1);
            }
            const background = rgb();
            context.fillStyle = getComputedStyle(element).color;
            context.fillRect(0, 0, 1, 1);
            return { background, foreground: rgb() };
          });
        for (const state of ["current", "hover", "keyboard"] as const) {
          if (state === "hover") await controls.hover();
          if (state === "keyboard") {
            await page.keyboard.press("Tab");
            await controls.focus();
          }
          await controls.evaluate(async (element) => {
            await Promise.all(element.getAnimations().map((animation) => animation.finished.catch(() => {})));
          });
          const colors = await readContrast();
          expect(colorContrast(colors.foreground, colors.background), state).toBeGreaterThanOrEqual(4.5);
          if (state === "keyboard") {
            await expect(controls).toBeFocused();
            expect(await controls.evaluate((element) => element.matches(":focus-visible"))).toBe(true);
          }
        }
      },
    );
  }
}

for (const mobile of [false, true]) {
  test(
    `selected typography keeps the Home reading order on ${mobile ? "mobile" : "desktop"}`,
    mobile ? { tag: "@mobile" } : {},
    async ({ page }, testInfo) => {
      await page.setViewportSize(mobile ? { width: 390, height: 844 } : { width: 1488, height: 1058 });
      await page.goto("/");
      await page.evaluate(() => document.fonts.ready);
      const heading = page.locator(".hero h1");
      await expect(heading).toHaveCSS("font-weight", "700");
      const intro = await page.locator(".hero-bottom > p").boundingBox();
      const actions = await page.locator(".hero-actions").boundingBox();
      expect(actions!.x).toBeCloseTo(intro!.x, 0);
      expect(actions!.y).toBeGreaterThanOrEqual(intro!.y + intro!.height);
      const aboutHeading = page.locator(".home-about h2");
      const aboutCopy = page.locator(".home-about > div:last-child");
      await aboutHeading.scrollIntoViewIfNeeded();
      const titleBox = await aboutHeading.boundingBox();
      const copyBox = await aboutCopy.boundingBox();
      expect(copyBox!.y).toBeGreaterThanOrEqual(titleBox!.y + titleBox!.height);
      expect(copyBox!.x).toBeCloseTo(titleBox!.x, 0);
      await heading.scrollIntoViewIfNeeded();
      await page.screenshot({ path: testInfo.outputPath(`typography-home-${mobile ? "mobile" : "desktop"}.png`) });
      await page.locator(".hero-actions .button").click();
      await expect(page).toHaveURL(/\/portfolio$/);
    },
  );
}

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  test(
    `${prefix || "English"} drawer and mobile table labels use approved treatments`,
    { tag: "@mobile" },
    async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(prefix || "/");
      await page.locator(".mobile-menu-button").click();
      await expect(page.locator('[data-menu-phase="open"]')).toBeVisible();
      const logo = page.locator(".mobile-menu-wordmark .brand-logo");
      await expect(logo).toHaveText("Modern Fundamental Analyst.");
      expect(await invalidTreatments(page)).toEqual([]);
      await page.locator(".mobile-language-disclosure > [data-slot=collapsible-trigger]").click();
      await expect(page.locator(".mobile-language-disclosure")).toHaveAttribute("data-open", "");
      expect(await invalidTreatments(page)).toEqual([]);
      await page.keyboard.press("Escape");
      await expect(page.locator(".mobile-menu-button")).toBeFocused();
      await page.goto(`${prefix}/portfolio`);
      const labels = await page.locator(".portfolio-row td[data-label]").evaluateAll((elements) =>
        elements.map((element) => {
          const style = getComputedStyle(element, "::before");
          return [
            Number.parseFloat(style.fontSize),
            Number.parseFloat(style.lineHeight),
            Number(style.fontWeight),
            style.letterSpacing === "normal" ? 0 : Number.parseFloat(style.letterSpacing),
          ];
        }),
      );
      expect(labels.length).toBeGreaterThan(0);
      for (const label of labels) {
        expect(label[0]).toBe(16);
        expect(label[1]).toBeCloseTo(24, 1);
        expect(label.slice(2)).toEqual([700, 0]);
      }
    },
  );
}

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  test(`${prefix || "English"} type breakpoints and dark appearance preserve the role contract`, async ({ page }) => {
    for (const width of [799, 800, 1199, 1200]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(prefix || "/");
      const heading = page.locator(".hero h1");
      await expect(heading).toHaveCSS("font-size", `${width < 800 ? 51 : width < 1200 ? 67 : 90}px`);
      await expect(page.locator(".metric strong").first()).toHaveCSS("font-size", "51px");
      const before = await heading.evaluate((element) => {
        const style = getComputedStyle(element);
        return [style.fontSize, style.lineHeight, style.fontWeight, style.letterSpacing];
      });
      await page.emulateMedia({ colorScheme: "dark" });
      await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
      expect(
        await heading.evaluate((element) => {
          const style = getComputedStyle(element);
          return [style.fontSize, style.lineHeight, style.fontWeight, style.letterSpacing];
        }),
      ).toEqual(before);
      await page.emulateMedia({ colorScheme: "light" });
    }
  });
}
