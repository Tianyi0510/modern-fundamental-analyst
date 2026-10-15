import { expect, test, type Page } from "@playwright/test";

type Role = keyof typeof roleScale;

const roleScale = {
  pageTitle: { size: 57, lineHeight: 64, weight: 500, tracking: -0.25 },
  sectionTitle: { size: 32, lineHeight: 40, weight: 500, tracking: 0 },
  cardTitle: { size: 22, lineHeight: 28, weight: 500, tracking: 0 },
  compactTitle: { size: 16, lineHeight: 24, weight: 700, tracking: 0.15 },
  lead: { size: 16, lineHeight: 24, weight: 400, tracking: 0.5 },
  bodyLarge: { size: 16, lineHeight: 24, weight: 400, tracking: 0.5 },
  body: { size: 14, lineHeight: 20, weight: 400, tracking: 0.25 },
  label: { size: 14, lineHeight: 20, weight: 500, tracking: 0.1 },
  control: { size: 14, lineHeight: 20, weight: 500, tracking: 0.1 },
  caption: { size: 12, lineHeight: 16, weight: 400, tracking: 0.4 },
  dataDisplay: { size: 57, lineHeight: 64, weight: 500, tracking: -0.25 },
  dataKpi: { size: 45, lineHeight: 52, weight: 500, tracking: 0 },
  dataRing: { size: 32, lineHeight: 40, weight: 500, tracking: 0 },
  dataRow: { size: 16, lineHeight: 24, weight: 500, tracking: 0.15 },
} as const;

const routeRoles: Record<string, Partial<Record<Role, string[]>>> = {
  "/": {
    pageTitle: [".hero h1"],
    sectionTitle: [".home-about h2", ".intro h2", ".section-heading h2", ".cta h2"],
    cardTitle: [".memo-card h3"],
    compactTitle: [".site-header .wordmark", ".footer-heading", ".holding-row strong"],
    lead: [".hero-bottom > p", ".home-about > div:last-child p", ".performance-copy p"],
    body: [".memo-card p", ".holding-row small"],
    label: [".eyebrow", ".section-number", ".metric > dt", ".memo-card > div"],
    control: [".header-actions nav a", ".button", ".text-link"],
    caption: [".metric small", ".memo-card > small", ".footer-bottom small"],
    dataDisplay: [".performance-copy > strong"],
    dataKpi: [".metric strong"],
    dataRing: [".allocation-ring > span"],
    dataRow: [".holding-row b"],
  },
  "/about": {
    pageTitle: [".page-hero h1"],
    sectionTitle: [".about-section-heading h2", ".about-closing h2"],
    compactTitle: [".about-boundaries h2", ".footer-heading"],
    lead: [".page-intro p"],
    bodyLarge: [".about-copy", ".about-boundaries ol", ".about-closing > div"],
    label: [".eyebrow", ".about-section-label"],
    caption: [".page-intro small", ".footer-bottom small"],
  },
  "/portfolio": {
    pageTitle: [".page-hero h1"],
    sectionTitle: [".portfolio-holdings-heading h2"],
    lead: [".page-intro p"],
    label: [
      ".eyebrow",
      ".portfolio-kpis dt",
      ".portfolio-holdings-heading > div > span",
      ".portfolio-mobile-sort label > span",
    ],
    control: [".portfolio-mobile-sort button"],
    caption: [".page-intro small", ".portfolio-kpis small"],
    dataKpi: [".portfolio-kpis strong"],
    dataRow: [".portfolio-row > *"],
  },
  "/performance": {
    pageTitle: [".page-hero h1"],
    sectionTitle: [".returns .section-heading h2", ".methodology h2"],
    compactTitle: ["#performance-twr-chart-title", "#performance-chart-title"],
    lead: [".page-intro p"],
    bodyLarge: [".methodology-content"],
    label: [".eyebrow", ".performance-summary dt", ".returns .section-number"],
    caption: [".page-intro small", ".performance-summary small"],
    dataKpi: [".performance-summary strong"],
  },
  "/memos": {
    pageTitle: [".page-hero h1"],
    cardTitle: [".memo-card h2", ".memo-index-row h2"],
    compactTitle: [".memo-disclosure > summary"],
    lead: [".page-intro p"],
    body: [".memo-card p", ".memo-index-row p"],
    label: [".eyebrow", ".memo-card > div"],
    caption: [".page-intro small", ".memo-meta"],
  },
  "/contact": {
    pageTitle: [".page-hero h1"],
    cardTitle: ["#contact-subscribe-title", "#contact-form-title"],
    lead: [".contact-note"],
    body: ["#contact-subscribe > header > p", ".contact-headingIntro"],
    label: [".eyebrow"],
    control: ["form .button"],
  },
  "/support": {
    pageTitle: [".page-hero h1"],
    sectionTitle: [".support-section h2"],
    lead: [".page-intro p"],
    bodyLarge: [".support-copy p", ".support-note"],
    label: [".eyebrow", ".support-form legend", ".support-amount-option > span"],
    control: [".support-submit"],
    dataKpi: [".support-amount-option strong"],
  },
  "/disclaimer": {
    pageTitle: [".legal h1"],
    sectionTitle: [".legal-section h2"],
    lead: [".legal-subtitle"],
    bodyLarge: [".legal-section-copy p"],
    label: [".eyebrow", ".legal-section-label"],
  },
  "/subscription-preferences": {
    pageTitle: ["main h1"],
    lead: [".page-intro p"],
    label: [".eyebrow"],
  },
  "/memos/microsoft-stock-analysis-fiscal-year-2024": {
    pageTitle: [".memo-article h1"],
    cardTitle: [".article-body h2"],
    compactTitle: [".memo-subsection h3"],
    lead: [".article-lead"],
    bodyLarge: [".article-body"],
    label: [".memo-article .eyebrow"],
    caption: [".article-meta"],
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
        "rgb(95, 205, 253)",
      );
      await expect(page.locator(".about-boundaries > section").last()).toHaveCSS("color", "rgb(0, 0, 0)");

      await page.goto("/contact");
      await expect(page.locator(".contact-band")).toHaveCSS("background-color", "rgb(95, 205, 253)");
      await expect(page.locator(".contact-section")).toHaveCSS("color", "rgb(0, 0, 0)");
      await expect(page.locator("#contact-subscribe")).toHaveCSS("color", "rgb(0, 0, 0)");
      await expect(page.locator("#contact-subscribe-title")).toBeVisible();
    },
  );
}

function expectedTreatment(role: Role, width: number) {
  return role === "pageTitle" && width <= 800
    ? { size: 36, lineHeight: 44, weight: 500, tracking: 0 }
    : roleScale[role];
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
            const undersized = await page.locator("body").evaluate((body) => {
              const minimum = (11 / 16) * Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
              return [...body.querySelectorAll("*")]
                .filter((element) => {
                  const rect = element.getBoundingClientRect();
                  return (
                    rect.width > 0 &&
                    rect.height > 0 &&
                    [...element.childNodes].some(
                      (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
                    ) &&
                    Number.parseFloat(getComputedStyle(element).fontSize) < minimum - 0.1
                  );
                })
                .map((element) => ({
                  text: element.textContent?.trim().slice(0, 80),
                  size: getComputedStyle(element).fontSize,
                }));
            });
            expect(undersized, `${prefix}${route} has text smaller than Material 3 Label Small`).toEqual([]);
            for (const { role, values } of await readTypography(page, roles)) {
              observed.set(role, [...(observed.get(role) ?? []), ...values]);
            }
          }

          for (const [role, values] of observed) {
            const treatment = expectedTreatment(role, viewport.width);
            const expectedFontSize = treatment.size;

            for (const sample of values) {
              const rhythm = treatment;
              const tracking = sample.selector.includes(".wordmark") ? sample.fontSize * -0.05 : rhythm.tracking;
              expect(
                Math.abs(sample.fontSize - expectedFontSize),
                `${role} sample ${sample.selector} resolved to ${sample.fontSize}px instead of ${expectedFontSize}px`,
              ).toBeLessThan(0.15);
              expect(
                Math.abs(sample.lineHeight - rhythm.lineHeight),
                `${role} sample ${sample.selector} has an inconsistent line height`,
              ).toBeLessThan(0.2);
              expect(
                Math.abs(sample.letterSpacing - tracking),
                `${role} sample ${sample.selector} has inconsistent letter spacing`,
              ).toBeLessThan(0.2);
              expect(sample.family.split(",")[0]!.replaceAll('"', "").trim()).toBe("Jost");
              const prominent = role === "dataRow" || role === "label";
              expect(
                prominent ? [rhythm.weight, 700] : [rhythm.weight],
                `${role} sample ${sample.selector} weight`,
              ).toContain(sample.weight);
            }
            expect(
              new Set(values.map(({ fontSize }) => fontSize.toFixed(2))).size,
              `${role} has multiple computed sizes`,
            ).toBe(1);
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
        await contactEmail.focus();
        await expect(contactEmail).toHaveCSS("color", "rgb(0, 0, 0)");
        await expect(contactEmail).toHaveCSS("outline-style", "solid");
        await expect(contactEmail).toHaveCSS("outline-color", "rgb(0, 41, 145)");
        const footerEmail = page.locator('.site-footer input[name="email"]');
        await footerEmail.focus();
        await expect(footerEmail).toHaveCSS("color", "rgb(255, 255, 255)");
        await expect(footerEmail).toHaveCSS("outline-color", "rgb(95, 205, 253)");
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
        await preferenceEmail.focus();
        await expect(preferenceEmail).toHaveCSS("color", "rgb(0, 0, 0)");
        await expect(preferenceEmail).toHaveCSS("outline-color", "rgb(0, 41, 145)");
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
        highlight: ["rgb(0, 41, 145)", "rgb(95, 205, 253)"],
        brand: ["rgb(95, 205, 253)", "rgb(0, 41, 145)"],
        paper: ["rgb(0, 41, 145)", "rgb(255, 255, 255)"],
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
    await field.focus();
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
            await page.locator(".memo-disclosure > summary").click();
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
              .locator(".metric strong, .performance-copy > strong, .holding-row")
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

const materialScale = [
  ["display-large", 57, 64, 400, -0.25],
  ["display-medium", 45, 52, 400, 0],
  ["display-small", 36, 44, 400, 0],
  ["headline-large", 32, 40, 400, 0],
  ["headline-medium", 28, 36, 400, 0],
  ["headline-small", 24, 32, 400, 0],
  ["title-large", 22, 28, 400, 0],
  ["title-medium", 16, 24, 500, 0.15],
  ["title-small", 14, 20, 500, 0.1],
  ["body-large", 16, 24, 400, 0.5],
  ["body-medium", 14, 20, 400, 0.25],
  ["body-small", 12, 16, 400, 0.4],
  ["label-large", 14, 20, 500, 0.1],
  ["label-medium", 12, 16, 500, 0.5],
  ["label-small", 11, 16, 500, 0.5],
] as const;

test(
  "all 15 baseline and emphasized Material 3 roles scale with text preferences",
  { tag: "@mobile" },
  async ({ page }) => {
    await page.goto("/");
    for (const emphasized of [false, true]) {
      for (const multiplier of [1, 2]) {
        const samples = await page.evaluate(
          ({ roles, multiplier, emphasized }) => {
            document.documentElement.style.fontSize = `${multiplier * 100}%`;
            return roles.map(([name]) => {
              const node = document.createElement("span");
              node.textContent = "Typography";
              const token = `--md-sys-typescale-${name}`;
              node.style.fontSize = `var(${token}-size)`;
              node.style.lineHeight = `var(${token}-line-height)`;
              node.style.fontWeight = emphasized
                ? `var(--md-sys-typescale-emphasized-${name}-weight)`
                : `var(${token}-weight)`;
              node.style.letterSpacing = `var(${token}-tracking)`;
              document.body.append(node);
              const style = getComputedStyle(node);
              const result = [
                parseFloat(style.fontSize),
                parseFloat(style.lineHeight),
                Number(style.fontWeight),
                style.letterSpacing === "normal" ? 0 : parseFloat(style.letterSpacing),
              ];
              node.remove();
              return result;
            });
          },
          { roles: materialScale, multiplier, emphasized },
        );
        for (const [index, [name, size, lineHeight, weight, tracking]] of materialScale.entries()) {
          const actual = samples[index]!;
          expect(actual[0], name + " size").toBeCloseTo(size * multiplier, 3);
          expect(actual[1], name + " line height").toBeCloseTo(lineHeight * multiplier, 3);
          expect(actual[2], name + " weight").toBe(emphasized ? (weight === 400 ? 500 : 700) : weight);
          expect(actual[3], name + " tracking").toBeCloseTo(tracking * multiplier, 3);
        }
      }
    }
  },
);
