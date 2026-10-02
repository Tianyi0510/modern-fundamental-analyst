"use client";

import { appearance, desktopNavigationLink, mobileNavigationLink, languageChoice } from "./site-header.styles";
import { ButtonLink } from "./button-link";

import Link from "next/link";
import { Check, ChevronDown, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { AnimatedDisclosure } from "@/components/animated-disclosure";
import { useLanguageMenu, useMenuTouchFeedback, useMobileMenu } from "@/components/use-site-header";
import { getLocalizedPath, localeConfig, locales, type Locale } from "@/lib/i18n";
import type { NavigationCopy } from "@/lib/navigation-copy";

type SiteHeaderProps = {
  copy: NavigationCopy;
  locale: Locale;
  languageQuery?: string;
};

export function SiteHeader({ copy, locale, languageQuery = "" }: SiteHeaderProps) {
  const pathname = usePathname();
  const {
    close: closeMenu,
    closeImmediately: closeMenuForNavigation,
    closeButtonRef: menuCloseButtonRef,
    contentRef: menuContentRef,
    drawerRef: menuDrawerRef,
    handlePointerCancel: handleMenuPointerCancel,
    handlePointerDown: handleMenuPointerDown,
    handlePointerUp: handleMenuPointerUp,
    isOpen: isMenuOpen,
    phase: menuPhase,
    open: openMenu,
    triggerRef: menuButtonRef,
  } = useMobileMenu();
  const {
    close: closeLanguageMenu,
    containerRef: languageMenuRef,
    focusItem: focusLanguageItem,
    isOpen: isLanguageOpen,
    open: openLanguageMenu,
    toggle: toggleLanguageMenu,
    triggerRef: languageButtonRef,
  } = useLanguageMenu();
  const menuTouchFeedback = useMenuTouchFeedback(menuButtonRef, menuCloseButtonRef);
  const menuLabel = copy.open;
  const closeLabel = copy.close;
  const homePath = getLocalizedPath("/", locale);
  const navigation = [
    { href: homePath, label: copy.home },
    { href: getLocalizedPath("/about", locale), label: copy.about },
    { href: getLocalizedPath("/portfolio", locale), label: copy.portfolio },
    { href: getLocalizedPath("/performance", locale), label: copy.performance },
    { href: getLocalizedPath("/memos", locale), label: copy.memos },
  ];
  const mobileNavigation = [...navigation, { href: getLocalizedPath("/contact", locale), label: copy.contact }];
  const isCurrentPath = (href: string) => pathname === href || (href !== homePath && pathname.startsWith(`${href}/`));

  return (
    <header className={appearance["site-header"] + " " + appearance["shell"]}>
      <Link
        className={appearance["wordmark"]}
        href={getLocalizedPath("/", locale)}
        aria-label={`Modern Fundamental Analyst ${copy.home}`}
        tabIndex={isMenuOpen ? -1 : undefined}
      >
        Modern Fundamental Analyst<span>.</span>
      </Link>
      <button
        ref={menuButtonRef}
        className={appearance["mobile-menu-button"]}
        type="button"
        aria-label={menuLabel}
        aria-expanded={isMenuOpen}
        aria-controls="mobile-site-menu"
        tabIndex={isMenuOpen ? -1 : undefined}
        {...menuTouchFeedback}
        onClick={openMenu}
      >
        <span className={appearance["mobile-menu-touch-ring"]} aria-hidden="true" />
        <Menu aria-hidden="true" strokeWidth={2} />
      </button>
      <div className={appearance["header-actions"]}>
        <nav className="flex gap-[12px]" aria-label={copy.primary}>
          {navigation.map(({ href, label }) => (
            <Link
              className={desktopNavigationLink}
              href={href}
              aria-current={isCurrentPath(href) ? "page" : undefined}
              key={href}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className={appearance["language-menu"]} ref={languageMenuRef}>
          <button
            ref={languageButtonRef}
            className={appearance["language-trigger"]}
            type="button"
            aria-label={copy.change}
            aria-haspopup="menu"
            aria-expanded={isLanguageOpen}
            aria-controls="desktop-language-menu"
            onClick={toggleLanguageMenu}
            onKeyDown={(event) => {
              if (!["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) return;
              event.preventDefault();
              event.stopPropagation();
              openLanguageMenu();
              focusLanguageItem(event.key === "ArrowUp" ? "last" : "first");
            }}
          >
            {localeConfig[locale].label}
            <ChevronDown aria-hidden="true" strokeWidth={2.75} />
          </button>
          <div
            className={`${appearance["language-dropdown"]}${isLanguageOpen ? " is-open" : ""}`}
            data-state={isLanguageOpen ? "open" : "closed"}
            id="desktop-language-menu"
            role="menu"
            aria-hidden={!isLanguageOpen}
            inert={!isLanguageOpen}
          >
            {locales.map((targetLocale) => (
              <Link
                className={languageChoice}
                href={`${getLocalizedPath(pathname, targetLocale)}${languageQuery ? `?${languageQuery}` : ""}`}
                hrefLang={localeConfig[targetLocale].hrefLang}
                role="menuitem"
                aria-current={locale === targetLocale ? "page" : undefined}
                tabIndex={-1}
                onClick={closeLanguageMenu}
                key={targetLocale}
              >
                <span>{localeConfig[targetLocale].label}</span>
                {locale === targetLocale && <Check aria-hidden="true" strokeWidth={2.25} />}
              </Link>
            ))}
          </div>
        </div>
        <ButtonLink
          variant="contrast"
          size="small"
          href={getLocalizedPath("/contact", locale)}
          aria-current={isCurrentPath(getLocalizedPath("/contact", locale)) ? "page" : undefined}
        >
          {copy.contact}
        </ButtonLink>
      </div>

      <div
        className={`${appearance["mobile-menu-layer"]}${isMenuOpen ? " is-open" : ""}`}
        data-state={isMenuOpen ? "open" : "closed"}
        data-menu-phase={menuPhase}
        aria-hidden={!isMenuOpen}
        inert={!isMenuOpen}
      >
        <aside
          ref={menuDrawerRef}
          className={appearance["mobile-menu-drawer"]}
          id="mobile-site-menu"
          role="dialog"
          aria-modal="true"
          aria-label={copy.siteMenu}
          onPointerCancel={handleMenuPointerCancel}
          onPointerDown={handleMenuPointerDown}
          onPointerUp={handleMenuPointerUp}
        >
          <div className={appearance["mobile-menu-top"]}>
            <Link
              className={appearance["wordmark"] + " " + appearance["mobile-menu-wordmark"]}
              href={homePath}
              onClick={closeMenuForNavigation}
              tabIndex={isMenuOpen ? 0 : -1}
            >
              Modern Fundamental Analyst<span>.</span>
            </Link>
            <button
              ref={menuCloseButtonRef}
              className={appearance["mobile-menu-close"]}
              type="button"
              aria-label={closeLabel}
              {...menuTouchFeedback}
              onClick={closeMenu}
              tabIndex={isMenuOpen ? 0 : -1}
            >
              <span className={appearance["mobile-menu-touch-ring"]} aria-hidden="true" />
              <X className={appearance["mobile-menu-close-icon"]} aria-hidden="true" strokeWidth={2} />
              <Menu className={appearance["mobile-menu-return-icon"]} aria-hidden="true" strokeWidth={2} />
            </button>
          </div>
          <div className={appearance["mobile-menu-content"]} ref={menuContentRef}>
            <nav
              className="relative z-[1] flex flex-col text-[length:var(--font-size-compact-title)] leading-[var(--leading-compact-title)] tracking-[var(--tracking-heading)] font-bold"
              aria-label={copy.mobilePrimary}
            >
              {mobileNavigation.map(({ href, label }) => (
                <Link
                  className={mobileNavigationLink}
                  href={href}
                  aria-current={isCurrentPath(href) ? "page" : undefined}
                  onClick={closeMenuForNavigation}
                  tabIndex={isMenuOpen ? 0 : -1}
                  key={href}
                >
                  <span className="mobile-menu-label">{label}</span>
                </Link>
              ))}
            </nav>
            <div className={appearance["mobile-language-links"]}>
              <AnimatedDisclosure
                className={appearance["mobile-language-disclosure"]}
                summary={
                  <>
                    <span>{localeConfig[locale].label}</span>
                    <ChevronDown aria-hidden="true" strokeWidth={2.75} />
                  </>
                }
              >
                <div className={appearance["mobile-language-options"]}>
                  {locales
                    .filter((targetLocale) => targetLocale !== locale)
                    .map((targetLocale) => (
                      <Link
                        className={appearance["mobile-menu-language"]}
                        href={`${getLocalizedPath(pathname, targetLocale)}${languageQuery ? `?${languageQuery}` : ""}`}
                        hrefLang={localeConfig[targetLocale].hrefLang}
                        onClick={closeMenuForNavigation}
                        tabIndex={isMenuOpen ? 0 : -1}
                        key={targetLocale}
                      >
                        {localeConfig[targetLocale].label}
                      </Link>
                    ))}
                </div>
              </AnimatedDisclosure>
            </div>
          </div>
        </aside>
      </div>
    </header>
  );
}
