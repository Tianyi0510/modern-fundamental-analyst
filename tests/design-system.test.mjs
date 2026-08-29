import assert from "node:assert/strict";
import test from "node:test";

import { read, readStyles } from "./repository-helpers.mjs";

test("typography uses centralized semantic role tokens", async () => {
  const [base, reset, globals, typography, componentTypography, chrome, pages, responsive, colors, contact, subscribe, preferences] = await Promise.all([
    read("app/styles/base.css"),
    read("app/reset.css"),
    read("app/globals.css"),
    read("app/styles/typography.css"),
    read("app/styles/component-typography.css"),
    read("app/styles/chrome.css"),
    read("app/styles/pages.css"),
    read("app/styles/responsive.css"),
    read("app/styles/colors.css"),
    read("components/contact-form.module.css"),
    read("components/subscribe-form.module.css"),
    read("components/subscription-preferences.module.css"),
  ]);
  const componentCss = `${reset}\n${globals}\n${typography}\n${componentTypography}\n${chrome}\n${pages}\n${responsive}\n${colors}\n${contact}\n${subscribe}\n${preferences}`;
  const css = `${base}\n${componentCss}`;

  assert.match(base, /--font-size-page-title:\s*clamp\(52px, 7\.778vw, 112px\)/);
  assert.match(base, /--font-size-lead:\s*clamp\(18px, 1\.528vw, 22px\)/);
  assert.match(base, /--font-size-data-kpi:\s*clamp\(48px, 4\.445vw, 64px\)/);
  assert.doesNotMatch(css, /--type-/);
  assert.doesNotMatch(componentCss, /--font-size-[a-z-]+\s*:/);
  for (const [, value] of componentCss.matchAll(/font-size:\s*([^;]+);/g)) {
    assert.match(value.trim(), /^var\(--font-size-[a-z-]+\)$/, `Non-role font-size declaration: ${value}`);
  }
  assert.doesNotMatch(responsive, /font-size\s*:/, "Responsive rules must not switch a component's typography role");
  assert.doesNotMatch(css, /--weight-medium/);
  assert.doesNotMatch(css, /font-weight:\s*(?:600|650|670|680|750|800)\b/);
});

test("Jost renders Latin text and numbers before locale-specific CJK fallbacks", async () => {
  const [fonts, document, css] = await Promise.all([
    read("lib/fonts.ts"),
    read("components/site-document.tsx"),
    readStyles(),
  ]);

  assert.match(fonts, /import \{ Jost, Noto_Sans_SC, Noto_Sans_TC \}/);
  assert.match(fonts, /variable: "--font-jost"/);
  assert.match(document, /jost\.variable/);
  assert.match(css, /--font-ui:\s*var\(--font-jost\)/);
  assert.match(css, /\[lang="zh-Hant-TW"\] body[^}]*--font-ui:\s*var\(--font-jost\),\s*var\(--font-noto-sans-tc\)/s);
  assert.match(css, /\[lang="zh-CN"\] body[^}]*--font-ui:\s*var\(--font-jost\),\s*var\(--font-noto-sans-sc\)/s);
  assert.doesNotMatch(`${fonts}\n${document}\n${css}`, /font-inter|\bInter\b|inter\.variable/);
});
test("editorial color roles keep the footer inverse and Medium Blue auxiliary", async () => {
  const css = await readStyles();

  assert.match(css, /--deep-blue:\s*#002991/);
  assert.match(css, /--medium-blue:\s*#008cff/);
  assert.match(css, /--surface-primary:\s*var\(--white\)/);
  assert.match(css, /--surface-inverse:\s*var\(--black\)/);
  assert.match(css, /--surface-brand:\s*var\(--deep-blue\)/);
  assert.match(css, /--text-secondary:\s*rgba\(0,0,0,\.62\)/);
  assert.match(css, /--text-tertiary:\s*rgba\(0,0,0,\.56\)/);
  assert.match(css, /--text-inverse-secondary:\s*rgba\(255,255,255,\.68\)/);
  assert.match(css, /--interactive-accent:\s*var\(--medium-blue\)/);
  assert.match(css, /\.site-footer\s*\{[^}]*background:\s*var\(--surface-inverse\)[^}]*color:\s*var\(--text-inverse\)/s);
  assert.match(css, /\.footer-brand\s*\{[^}]*gap:\s*14px/s);
  assert.match(css, /\.site-footer \.footer-heading\s*\{[^}]*margin-bottom:\s*14px/s);
  assert.match(css, /\.site-footer \.footer-heading\s*\{[^}]*font-size:\s*var\(--font-size-compact-title\)/s);
  assert.match(css, /\.site-footer \.footer-heading\s*\{[^}]*letter-spacing:\s*var\(--tracking-heading\)/s);
  assert.match(css, /\.site-footer \.footer-heading\s*\{[^}]*line-height:\s*var\(--leading-heading\)/s);
  assert.match(css, /\.home-page \.cta\s*\{[^}]*background:\s*var\(--surface-highlight\)[^}]*color:\s*var\(--text-primary\)/s);
  assert.match(css, /\.home-page \.cta \.button-dark\s*\{[^}]*background:\s*var\(--black\)[^}]*color:\s*var\(--white\)/s);
  assert.match(css, /\.portfolio-page \.portfolio-kpis > div:nth-child\(1\)\s*\{[^}]*background:\s*var\(--surface-primary\);[^}]*color:\s*var\(--text-primary\)/s);
  assert.match(css, /\.portfolio-page \.portfolio-kpis > div:nth-child\(2\)\s*\{[^}]*background:\s*var\(--surface-highlight\);[^}]*color:\s*var\(--text-brand\)/s);
  assert.match(css, /\.portfolio-page \.portfolio-kpis > div:nth-child\(3\)\s*\{[^}]*background:\s*var\(--surface-brand\);[^}]*color:\s*var\(--text-highlight\)/s);
  assert.match(css, /\.portfolio-page \.portfolio-kpis > div:nth-child\(4\)\s*\{[^}]*background:\s*var\(--surface-primary\);[^}]*color:\s*var\(--text-brand\)/s);
  assert.match(css, /\.home-page \.metric-band > \.metric:nth-child\(1\),\s*\.performance-page \.performance-summary > div:nth-child\(1\)\s*\{[^}]*background:\s*var\(--surface-highlight\);[^}]*color:\s*var\(--text-brand\);/s);
  assert.match(css, /\.about-boundaries > article:first-child[^}]*\{[^}]*background:\s*var\(--surface-inverse\);[^}]*color:\s*var\(--text-inverse\);/s);
  assert.match(css, /\.about-boundaries > article:last-child\s*\{[^}]*background:\s*var\(--surface-highlight\);[^}]*color:\s*var\(--text-primary\);/s);
  assert.match(css, /\.home-page \.metric-band > \.metric:nth-child\(2\),\s*\.performance-page \.performance-summary > div:nth-child\(2\)\s*\{[^}]*background:\s*var\(--surface-brand\);[^}]*color:\s*var\(--text-highlight\);/s);
  assert.match(css, /\.home-page \.metric-band > \.metric:nth-child\(3\),\s*\.performance-page \.performance-summary > div:nth-child\(3\)\s*\{[^}]*background:\s*var\(--surface-primary\);[^}]*color:\s*var\(--text-brand\);/s);
  assert.match(css, /\.home-opening\s*\{[^}]*background:\s*var\(--background-gray\)/s);
  assert.match(css, /\.home-opening > \.site-header\s*\{[^}]*background:\s*var\(--white\)/s);
  assert.match(css, /\.memos-home\s*\{[^}]*background:\s*var\(--background-gray\)/s);
  assert.match(css, /\.home-about > div:last-child p\s*\{[^}]*color:\s*var\(--black\)/s);
  assert.match(css, /\.home-about > div:last-child p\s*\{[^}]*font-size:\s*var\(--font-size-lead\)/s);
  assert.match(css, /\.about-page \.page-intro p,[\s\S]*?\.about-page \.about-copy,[\s\S]*?\.about-page \.about-boundaries > article:last-child ol,[\s\S]*?\.about-page \.about-closing > div\s*\{\s*color:\s*var\(--black\)/);
  assert.match(css, /\.performance-home\s*\{[^}]*background:\s*var\(--surface-primary\);[^}]*color:\s*var\(--text-primary\)/s);
  assert.match(css, /\.performance-home \.button-white\s*\{[^}]*background:\s*var\(--black\);[^}]*color:\s*var\(--white\)/s);
  assert.match(css, /\.contact-grid > article:first-child[^}]*\{[^}]*background:\s*var\(--surface-inverse\);[^}]*color:\s*var\(--text-inverse\)/s);
  assert.match(css, /\.contact-grid > article:first-child p\s*\{[^}]*color:\s*var\(--text-inverse\)/s);
  assert.match(css, /\.contact-grid > article:nth-child\(2\)\s*\{[^}]*background:\s*var\(--surface-primary\);[^}]*color:\s*var\(--text-primary\)/s);
  assert.doesNotMatch(css, /\.about-boundaries\s*\{[^}]*min-height:\s*100svh/s);
  assert.match(css, /--space-section:\s*var\(--space-11\)/);
  assert.match(css, /--space-section-compact:\s*var\(--space-10\)/);
  assert.match(css, /--space-heading-content:\s*var\(--space-9\)/);
  assert.match(css, /\.about-boundaries > article\s*\{[^}]*padding:\s*var\(--space-section\) 48px/s);
  assert.doesNotMatch(css, /\.contact-grid\s*\{[^}]*min-height:\s*100svh/s);
  assert.match(css, /\.contact-grid > article\s*\{[^}]*padding:\s*var\(--space-section\) 48px/s);
  assert.match(css, /\.about-boundaries ol\s*\{[^}]*margin:\s*var\(--space-related-content\) 0 0/s);
  assert.match(css, /\.contact-grid p\s*\{[^}]*margin:\s*var\(--space-related-content\) 0 0/s);
  assert.match(css, /\.about-boundaries li\s*\{\s*border-top:\s*0;/s);
  assert.doesNotMatch(css, /\.(?:site-header|home-opening|home-about|page-hero|about-section|about-boundaries|about-closing|portfolio-kpis|portfolio-holdings-heading|methodology|contact-grid|site-footer)\s*\{[^}]*(?:border-top|border-bottom):/s);
  assert.match(css, /\.memo-index\s*\{[^}]*padding:\s*var\(--space-section\) 0/s);
  assert.doesNotMatch(css, /\.performance-summary > div:nth-child\(3\)[^{]*\{[^}]*box-shadow:\s*inset 0 0 0 1px var\(--black\)/s);
});

test("editorial copy preserves authored casing and mobile arrows have intentional touch motion", async () => {
  const [typography, responsive, subscribe, contact, home, chrome] = await Promise.all([
    read("app/styles/typography.css"),
    read("app/styles/responsive.css"),
    read("components/subscribe-form.module.css"),
    read("components/contact-form.module.css"),
    read("components/home-page-content.tsx"),
    read("app/styles/chrome.css"),
  ]);

  assert.match(typography, /\.hero h1,[\s\S]*?text-transform:\s*none;/);
  assert.match(typography, /\.hero-bottom > p,[\s\S]*?\.legal \.legal-subtitle\s*\{[\s\S]*?font-size:\s*var\(--font-size-lead\);[\s\S]*?text-transform:\s*none;/);
  assert.doesNotMatch(`${typography}\n${responsive}\n${subscribe}\n${contact}`, /text-transform:\s*capitalize/);
  assert.match(responsive, /\.arrow-icon\s*\{[^}]*font-weight:\s*var\(--weight-bold\);[^}]*-webkit-text-stroke:\s*\.45px currentColor;[^}]*transition:\s*transform/s);
  assert.match(responsive, /\.home-page \.text-link:active \.arrow-icon,[\s\S]*?\.allocation-card > a:active \.arrow-icon\s*\{\s*transform:\s*translateX\(5px\);/);
  assert.match(responsive, /\.home-page \.round-link:active \.arrow-icon\s*\{\s*transform:\s*translate\(3px, -3px\);/);
  assert.doesNotMatch(responsive, /\.memo-index-row:active \.arrow-icon/);
  assert.match(home, /import \{ MoveRight, MoveUpRight \} from "lucide-react"/);
  assert.equal((home.match(/<MoveRight className="arrow-icon"[^>]*strokeWidth=\{3\} \/>/g) ?? []).length, 4);

  assert.match(home, /<MoveUpRight className="arrow-icon round-link-arrow"[^>]*strokeWidth=\{3\}/);
  assert.doesNotMatch(home, /<span className="arrow-icon"[^>]*>[→↗]/);
  assert.match(chrome, /\.home-page \.text-link \.arrow-icon, \.home-page \.allocation-card > a \.arrow-icon \{[^}]*stroke-width:\s*3;/);
  assert.match(responsive, /\.home-page \.round-link \.round-link-arrow\s*\{[^}]*stroke-width:\s*3;/);
  assert.match(subscribe, /\.section h2\s*\{[^}]*color:\s*var\(--white\)/);
  assert.match(subscribe, /\.submit\s*\{[^}]*background:\s*var\(--white\);[^}]*color:\s*var\(--black\)/);
  assert.match(subscribe, /\.submit:hover:not\(:disabled\), \.submit:focus-visible:not\(:disabled\)\s*\{[^}]*background:\s*var\(--bright-blue\);[^}]*color:\s*var\(--black\)/);
});

test("page sections share one responsive vertical rhythm", async () => {
  const css = await readStyles();

  assert.match(css, /--space-1:\s*4px;[\s\S]*--space-11:\s*96px;/);
  assert.match(css, /--space-section:\s*var\(--space-11\)/);
  assert.match(css, /--space-section-compact:\s*var\(--space-10\)/);
  assert.match(css, /--space-heading-content:\s*var\(--space-9\)/);
  assert.match(css, /--space-related-content:\s*var\(--space-7\)/);
  assert.match(css, /@media \(max-width: 800px\)[\s\S]*--space-page-gutter:\s*var\(--space-4\);[\s\S]*--space-section:\s*var\(--space-10\);[\s\S]*--space-section-compact:\s*var\(--space-9\);[\s\S]*--space-heading-content:\s*var\(--space-7\);[\s\S]*--space-related-content:\s*var\(--space-6\);/);
  assert.match(css, /--tracking-caption:\s*\.02em/);
  assert.match(css, /--motion-duration-fast:\s*180ms/);
  assert.match(css, /--motion-duration-base:\s*220ms/);
  assert.match(css, /--motion-duration-slow:\s*360ms/);
  assert.match(css, /--motion-ease-standard:\s*cubic-bezier\(\.2, 0, 0, 1\)/);
  assert.match(css, /--motion-ease-emphasized:\s*cubic-bezier\(\.22, 1, \.36, 1\)/);
  assert.match(css, /\.hero\s*\{[^}]*padding:\s*var\(--space-section\) 0/s);
  assert.match(css, /\.page-hero\s*\{[^}]*padding:\s*var\(--space-section\) 0/s);
  assert.match(css, /\.legal-hero\s*\{[^}]*padding:\s*var\(--space-section\) 0/s);
  assert.match(css, /\.memo-article\s*\{[^}]*padding:\s*0 0 var\(--space-section\)/s);
  assert.match(css, /\.memo-article-header\s*\{[^}]*padding-top:\s*var\(--space-section\)/s);
  assert.match(css, /\.legal-section\s*\{[^}]*padding:\s*var\(--space-section-compact\) 0/s);
  assert.match(css, /\.memo-section \+ \.memo-section\s*\{[^}]*margin-top:\s*var\(--space-section\);[^}]*padding-top:\s*var\(--space-section-compact\)/s);
  assert.match(css, /\.contact-hero\s*\{[^}]*min-height:\s*0/s);
  assert.match(css, /\.eyebrow\s*\{[^}]*margin:\s*0/s);
  assert.match(css, /\.section-number\s*\{[^}]*margin:\s*0/s);
  assert.match(css, /\.article-meta\s*\{[^}]*align-items:\s*center;[^}]*flex-wrap:\s*wrap/s);
  assert.match(css, /@media \(max-width:\s*800px\)[\s\S]*?\.return-row\s*\{[^}]*align-items:\s*start/s);
});

test("tablet navigation compacts before the mobile breakpoint", async () => {
  const responsive = await read("app/styles/responsive.css");

  assert.match(responsive, /@media \(max-width: 1100px\) and \(min-width: 801px\)[\s\S]*?\.site-header \.wordmark\s*\{\s*max-width:\s*150px;/);
  assert.match(responsive, /@media \(max-width: 1100px\) and \(min-width: 801px\)[\s\S]*?\.site-header nav\s*\{\s*gap:\s*10px;/);
  assert.match(responsive, /@media \(max-width: 1100px\) and \(min-width: 801px\)[\s\S]*?\.returns,[\s\S]*?\.methodology\s*\{\s*grid-template-columns:\s*1fr;/);
  assert.doesNotMatch(responsive, /@media \(max-width: 1100px\) and \(min-width: 801px\)[\s\S]*?\.metric strong\s*\{[^}]*font-size:/);
});

test("mobile navigation uses coordinated motion with a reduced-motion fallback", async () => {
  const [header, behavior, css] = await Promise.all([
    read("components/site-header.tsx"),
    read("components/use-site-header.ts"),
    readStyles(),
  ]);

  assert.match(header, /aria-modal="true"/);
  assert.match(behavior, /event\.key === "Escape"/);
  assert.match(css, /\.mobile-menu-drawer\s*\{[^}]*translateX\(calc\(100% \+ 24px\)\)[^}]*var\(--motion-duration-slow\)[^;]*var\(--motion-ease-emphasized\)/s);
  assert.match(css, /\.mobile-menu-drawer nav a::after \{ display: none; \}/);
  assert.match(css, /\.mobile-menu-layer\.is-open \.mobile-menu-top/);
  assert.match(css, /\.mobile-menu-layer\.is-open \.mobile-language-links/);
  assert.match(css, /@media \(hover: none\) and \(pointer: coarse\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)\s*\{\s*html\s*\{\s*scroll-behavior:\s*auto;/s);
});
