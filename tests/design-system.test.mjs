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

  assert.match(base, /--font-size-page-title:\s*clamp\(3\.25rem, 1\.75rem \+ 5vw, 7rem\)/);
  assert.match(base, /--font-size-section-title:\s*clamp\(2\.75rem, 2\.125rem \+ 2\.5vw, 4\.5rem\)/);
  assert.match(base, /--font-size-card-title:\s*clamp\(2rem, 1\.75rem \+ 1vw, 2\.625rem\)/);
  assert.match(base, /--font-size-compact-title:\s*clamp\(1\.25rem, 1\.125rem \+ \.5vw, 1\.5rem\)/);
  assert.match(base, /--font-size-lead:\s*1\.375rem/);
  assert.match(base, /--font-size-body-large:\s*1\.125rem/);
  assert.match(base, /--font-size-body:\s*1rem/);
  assert.match(base, /--font-size-label:\s*1rem/);
  assert.match(base, /--font-size-caption:\s*\.9375rem/);
  assert.match(base, /--font-size-data-ring:\s*2\.5rem/);
  assert.match(base, /--tracking-heading:\s*-\.05em/);
  assert.match(base, /--tracking-body:\s*0/);
  assert.match(base, /--tracking-label:\s*\.05em/);
  assert.match(base, /--leading-page-title:\s*1\.05/);
  assert.match(base, /--leading-section-title:\s*1\.1/);
  assert.match(base, /--leading-card-title:\s*1\.1/);
  assert.match(base, /--leading-compact-title:\s*1\.2/);
  assert.match(base, /--leading-data:\s*1/);
  assert.match(base, /--leading-body:\s*1\.5/);
  assert.doesNotMatch(css, /font-size-(?:utility|subsection)-title/);
  assert.doesNotMatch(css, /--leading-heading/);
  assert.doesNotMatch(css, /--tracking-(?!heading|body|label)[a-z-]+/);
  assert.match(base, /--font-size-data-kpi:\s*clamp\(3rem, 2\.5rem \+ 1\.5vw, 4rem\)/);
  assert.doesNotMatch(css, /--type-/);
  assert.doesNotMatch(componentCss, /--font-size-[a-z-]+\s*:/);
  for (const [, value] of componentCss.matchAll(/font-size:\s*([^;]+);/g)) {
    assert.match(value.trim(), /^var\(--font-size-[a-z-]+\)$/, `Non-role font-size declaration: ${value}`);
  }
  assert.doesNotMatch(responsive, /font-size\s*:/, "Responsive rules must not switch a component's typography role");
  assert.match(base, /body\s*\{[^}]*font-size:\s*var\(--font-size-body\);[^}]*line-height:\s*var\(--leading-body\)/s);
  assert.match(chrome, /\.button\s*\{[^}]*padding:\s*0 1\.6em;[^}]*gap:\s*1\.333em/s);
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
  assert.match(css, /\.site-footer \.footer-heading\s*\{[^}]*line-height:\s*var\(--leading-compact-title\)/s);
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
  assert.match(chrome, /\.home-page \.round-link\s*\{[^}]*border-color:\s*transparent;/s);
  assert.doesNotMatch(responsive, /\.memo-index-row:active \.arrow-icon/);
  assert.match(home, /import \{ MoveRight, MoveUpRight \} from "lucide-react"/);
  assert.equal((home.match(/<MoveRight className="arrow-icon"[^>]*strokeWidth=\{3\} \/>/g) ?? []).length, 4);

  assert.match(home, /<MoveUpRight className="arrow-icon round-link-arrow"[^>]*strokeWidth=\{3\}/);
  assert.doesNotMatch(home, /<span className="arrow-icon"[^>]*>[→↗]/);
  assert.match(chrome, /\.home-page \.text-link \.arrow-icon, \.home-page \.allocation-card > a \.arrow-icon \{[^}]*stroke-width:\s*3;/);
  assert.match(chrome, /\.site-header \.wordmark,[\s\S]*?\.site-footer \.wordmark\s*\{\s*transition:\s*none;/);
  assert.match(chrome, /\.site-header \.wordmark:hover,[\s\S]*?\.site-footer \.wordmark:active\s*\{[^}]*color:\s*inherit;[^}]*transform:\s*none;/s);
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
  assert.match(css, /@media \(max-width:\s*800px\)[\s\S]*?\.performance-page \.performance-summary > div\s*\{[^}]*min-height:\s*168px;[^}]*padding:\s*var\(--space-5\) var\(--space-page-gutter\)/s);
  assert.match(css, /@media \(max-width:\s*800px\)[\s\S]*?\.performance-page \.methodology\s*\{[^}]*gap:\s*var\(--space-heading-content\)/s);
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
  assert.match(css, /\.mobile-menu-drawer\s*\{[^}]*width:\s*100%;[^}]*background:\s*var\(--background-gray\);[^}]*clip-path:\s*inset\(0 0 100% 0\);[^}]*translateY\(-12px\)[^}]*var\(--motion-duration-slow\)[^;]*var\(--motion-ease-emphasized\)/s);
  assert.match(css, /\.site-header\.is-scrolled\s*\{[^}]*box-shadow:/s);
  assert.doesNotMatch(css, /\.site-header nav a::after/);
  assert.match(css, /\.site-header nav a:hover, \.site-header nav a:focus-visible \{[^}]*background:[^}]*transform: translateY\(-1px\)/s);
  assert.match(css, /\.site-header nav a:active \{[^}]*background: var\(--bright-blue\);[^}]*transform: scale\(\.97\)/s);
  assert.match(css, /\.language-dropdown a:hover, \.language-dropdown a:focus-visible \{[^}]*transform: translateX\(4px\)/s);
  assert.doesNotMatch(header, /mobile-menu-index/);
  assert.match(header, /mobile-menu-label/);
  assert.match(header, /className="wordmark mobile-menu-wordmark"/);
  assert.match(header, /<MoveRight aria-hidden="true" strokeWidth=\{2\.75\}/);
  assert.match(css, /grid-template-columns:\s*minmax\(0, 1fr\) 28px/);
  assert.match(css, /\.mobile-language-links \.mobile-menu-language:first-child\s*\{[^}]*border-top:\s*1px solid var\(--gray\)/s);
  assert.match(css, /\.mobile-menu-drawer nav a\[aria-current="page"\]\s*\{[^}]*background:\s*color-mix\(in srgb, var\(--bright-blue\) 42%, var\(--white\)\);[^}]*color:\s*var\(--interactive-accent\)/s);
  assert.doesNotMatch(css, /\.mobile-menu-drawer nav a\[aria-current="page"\]::before\s*\{[^}]*scaleY\(1\)/s);
  assert.match(css, /\.mobile-menu-top\s*\{[^}]*position:\s*sticky;[^}]*top:\s*0;[^}]*background:\s*var\(--white\)/s);
  assert.match(css, /\.mobile-menu-layer\.is-open \.mobile-language-links/);
  assert.match(css, /@media \(hover: none\) and \(pointer: coarse\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)\s*\{\s*html\s*\{\s*scroll-behavior:\s*auto;/s);
});
