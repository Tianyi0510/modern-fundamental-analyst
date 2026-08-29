import { expect, test, type Page } from "@playwright/test";

type Role = keyof typeof roleScale;

const roleScale = {
  pageTitle: { min: 52, fluidVw: 7.778, max: 112 },
  sectionTitle: { min: 44, fluidVw: 5, max: 72 },
  cardTitle: { min: 32, fluidVw: 2.917, max: 42 },
  compactTitle: { min: 20, fluidVw: 1.667, max: 24 },
  lead: { min: 18, fluidVw: 1.528, max: 22 },
  bodyLarge: { min: 18, max: 18 },
  body: { min: 16, max: 16 },
  label: { min: 16, max: 16 },
  control: { min: 15, max: 15 },
  caption: { min: 14, max: 14 },
  dataDisplay: { min: 52, fluidVw: 6.667, max: 96 },
  dataKpi: { min: 48, fluidVw: 4.445, max: 64 },
  dataRing: { min: 40, max: 40 },
  dataRow: { min: 20, max: 20 },
} as const;

const routeRoles: Record<string, Partial<Record<Role, string[]>>> = {
  "/": {
    pageTitle: [".hero h1"],
    sectionTitle: [".home-about h2", ".intro h2", ".section-heading h2", ".cta h2"],
    cardTitle: [".memo-card h3"],
    compactTitle: [".site-header .wordmark", ".footer-heading", ".holding-row strong"],
    lead: [".hero-bottom > p", ".home-about > div:last-child p", ".performance-copy p"],
    body: [".memo-card p", ".holding-row small"],
    label: [".eyebrow", ".section-number", ".metric > span", ".memo-card > div"],
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
    label: [".eyebrow", ".portfolio-kpis span", ".portfolio-holdings-heading > div > span", ".portfolio-mobile-sort label > span"],
    control: [".portfolio-mobile-sort button"],
    caption: [".page-intro small", ".portfolio-kpis small"],
    dataKpi: [".portfolio-kpis strong"],
    dataRow: [".portfolio-row > *"],
  },
  "/performance": {
    pageTitle: [".page-hero h1"],
    sectionTitle: [".returns .section-heading h2", ".methodology h2"],
    lead: [".page-intro p"],
    bodyLarge: [".methodology-content"],
    label: [".eyebrow", ".performance-summary span", ".returns .section-number"],
    caption: [".page-intro small", ".performance-summary small"],
    dataKpi: [".performance-summary strong"],
    dataRow: [".return-row strong"],
  },
  "/memos": {
    pageTitle: [".page-hero h1"],
    cardTitle: [".memo-card h3", ".memo-index-row h2"],
    compactTitle: [".memo-disclosure > summary"],
    lead: [".page-intro p"],
    body: [".memo-card p", ".memo-index-row p"],
    label: [".eyebrow", ".memo-card > div"],
    caption: [".page-intro small", ".memo-meta"],
  },
  "/contact": {
    pageTitle: [".page-hero h1"],
    cardTitle: [".contact-grid h2", "#contact-form-title"],
    lead: [".contact-note"],
    bodyLarge: [".contact-grid p"],
    label: [".eyebrow"],
    control: ["form .button"],
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
};

const viewports = [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "tablet-boundary", width: 801, height: 1000 },
  { name: "mobile", width: 390, height: 844 },
] as const;

function expectedSize(role: Role, width: number) {
  const scale = roleScale[role];
  if (!("fluidVw" in scale)) return scale.min;
  return Math.min(scale.max, Math.max(scale.min, width * scale.fluidVw / 100));
}

const headingRoles = new Set<Role>(["pageTitle", "sectionTitle", "cardTitle", "compactTitle", "dataDisplay", "dataKpi", "dataRing", "dataRow"]);

function expectedRhythm(role: Role) {
  if (headingRoles.has(role)) return { lineHeight: 1, trackingEm: -0.05 };
  if (role === "label") return { lineHeight: 1.5, trackingEm: 0.05 };
  return { lineHeight: 1.5, trackingEm: 0 };
}

type TypographySample = { selector: string; fontSize: number; lineHeight: number; letterSpacing: number };

async function readTypography(page: Page, selectors: string[]) {
  const values: TypographySample[] = [];
  for (const selector of selectors) {
    const locator = page.locator(selector);
    expect(await locator.count(), `Missing typography sample: ${selector}`).toBeGreaterThan(0);
    values.push(...await locator.evaluateAll((elements, sampleSelector) => elements.map((element) => {
      const style = getComputedStyle(element);
      return {
        selector: sampleSelector,
        fontSize: Number.parseFloat(style.fontSize),
        lineHeight: Number.parseFloat(style.lineHeight),
        letterSpacing: style.letterSpacing === "normal" ? 0 : Number.parseFloat(style.letterSpacing),
      };
    }), selector));
  }
  return values;
}

for (const viewport of viewports) {
  test.describe(`${viewport.name} typography at ${viewport.width}px`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    test("each semantic role resolves to one computed type treatment", async ({ page }) => {
      const observed = new Map<Role, TypographySample[]>();

      for (const [route, roles] of Object.entries(routeRoles)) {
        await page.goto(route);
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
          `${route} has horizontal overflow at ${viewport.width}px`,
        ).toBe(true);
        for (const [role, selectors] of Object.entries(roles) as Array<[Role, string[]]>) {
          const values = await readTypography(page, selectors);
          observed.set(role, [...(observed.get(role) ?? []), ...values]);
        }
      }

      for (const [role, values] of observed) {
        const expectedFontSize = expectedSize(role, viewport.width);
        const rhythm = expectedRhythm(role);
        for (const sample of values) {
          expect(Math.abs(sample.fontSize - expectedFontSize), `${role} sample ${sample.selector} resolved to ${sample.fontSize}px instead of ${expectedFontSize}px`).toBeLessThan(0.15);
          expect(Math.abs(sample.lineHeight - sample.fontSize * rhythm.lineHeight), `${role} sample ${sample.selector} has an inconsistent line height`).toBeLessThan(0.2);
          expect(Math.abs(sample.letterSpacing - sample.fontSize * rhythm.trackingEm), `${role} sample ${sample.selector} has inconsistent letter spacing`).toBeLessThan(0.2);
        }
        expect(new Set(values.map(({ fontSize }) => fontSize.toFixed(2))).size, `${role} has multiple computed sizes`).toBe(1);
      }
    });
  });
}
