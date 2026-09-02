"use client";

import Link from "next/link";
import { Check, ChevronDown, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useLanguageMenu, useMobileMenu } from "@/components/use-site-header";
import { getLocalizedPath, localeConfig, locales, type Locale } from "@/lib/i18n";
import type { NavigationCopy } from "@/lib/navigation-copy";

type SiteHeaderProps = {
  copy: NavigationCopy;
  locale: Locale;
};

export function SiteHeader({ copy, locale }: SiteHeaderProps) {
  const prefix = localeConfig[locale].prefix;
  const pathname = usePathname();
  const {
    close: closeMenu,
    closeButtonRef: menuCloseButtonRef,
    drawerRef: menuDrawerRef,
    handlePointerCancel: handleMenuPointerCancel,
    handlePointerDown: handleMenuPointerDown,
    handlePointerUp: handleMenuPointerUp,
    isOpen: isMenuOpen,
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
  const menuLabel = copy.open;
  const closeLabel = copy.close;
  const homePath = prefix || "/";
  const navigation = [
    { href: homePath, label: copy.home },
    { href: `${prefix}/about`, label: copy.about },
    { href: `${prefix}/portfolio`, label: copy.portfolio },
    { href: `${prefix}/performance`, label: copy.performance },
    { href: `${prefix}/memos`, label: copy.memos },
  ];
  const mobileNavigation = [...navigation, { href: `${prefix}/contact`, label: copy.contact }];
  const isCurrentPath = (href: string) => pathname === href || (href !== homePath && pathname.startsWith(`${href}/`));

  return (
    <header className="site-header shell">
      <Link className="wordmark" href={prefix || "/"} aria-label={`Modern Fundamental Analyst ${copy.home}`}>
        Modern Fundamental Analyst<span>.</span>
      </Link>
      <button
        ref={menuButtonRef}
        className="mobile-menu-button"
        type="button"
        aria-label={menuLabel}
        aria-expanded={isMenuOpen}
        aria-controls="mobile-site-menu"
        onClick={openMenu}
      >
        <Menu aria-hidden="true" strokeWidth={2} />
      </button>
      <div className="header-actions">
        <nav aria-label={copy.primary}>
          {navigation.map(({ href, label }) => (
            <Link href={href} aria-current={isCurrentPath(href) ? "page" : undefined} key={href}>{label}</Link>
          ))}
        </nav>
        <div className="language-menu" ref={languageMenuRef}>
          <button
            ref={languageButtonRef}
            className="language-trigger"
            type="button"
            aria-label={copy.change}
            aria-haspopup="menu"
            aria-expanded={isLanguageOpen}
            aria-controls="desktop-language-menu"
            onClick={toggleLanguageMenu}
            onKeyDown={(event) => {
              if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
              event.preventDefault();
              openLanguageMenu();
              focusLanguageItem(event.key === "ArrowDown" ? "first" : "last");
            }}
          >
            {localeConfig[locale].label}
            <ChevronDown aria-hidden="true" strokeWidth={2.75} />
          </button>
          <div className={`language-dropdown${isLanguageOpen ? " is-open" : ""}`} id="desktop-language-menu" role="menu" aria-hidden={!isLanguageOpen}>
            {locales.map((targetLocale) => <Link href={getLocalizedPath(pathname, targetLocale)} hrefLang={localeConfig[targetLocale].hrefLang} role="menuitem" aria-current={locale === targetLocale ? "page" : undefined} tabIndex={isLanguageOpen ? 0 : -1} onClick={closeLanguageMenu} key={targetLocale}>
              <span>{localeConfig[targetLocale].label}</span>
              {locale === targetLocale && <Check aria-hidden="true" strokeWidth={2.25} />}
            </Link>)}
          </div>
        </div>
        <Link className="button button-dark button-small" href={`${prefix}/contact`} aria-current={isCurrentPath(`${prefix}/contact`) ? "page" : undefined}>
          {copy.contact}
        </Link>
      </div>

      <div className={`mobile-menu-layer${isMenuOpen ? " is-open" : ""}`} aria-hidden={!isMenuOpen}>
        <button className="mobile-menu-backdrop" type="button" aria-label={closeLabel} onClick={closeMenu} tabIndex={isMenuOpen ? 0 : -1} />
        <aside
          ref={menuDrawerRef}
          className="mobile-menu-drawer"
          id="mobile-site-menu"
          role="dialog"
          aria-modal="true"
          aria-label={copy.siteMenu}
          onPointerCancel={handleMenuPointerCancel}
          onPointerDown={handleMenuPointerDown}
          onPointerUp={handleMenuPointerUp}
        >
          <div className="mobile-menu-top">
            <Link className="wordmark mobile-menu-wordmark" href={homePath} onClick={closeMenu} tabIndex={isMenuOpen ? 0 : -1}>
              Modern Fundamental Analyst<span>.</span>
            </Link>
            <button ref={menuCloseButtonRef} className="mobile-menu-close" type="button" aria-label={closeLabel} onClick={closeMenu} tabIndex={isMenuOpen ? 0 : -1}>
              <X aria-hidden="true" strokeWidth={2} />
            </button>
          </div>
          <nav aria-label={copy.mobilePrimary}>
            {mobileNavigation.map(({ href, label }) => (
              <Link href={href} aria-current={isCurrentPath(href) ? "page" : undefined} onClick={closeMenu} tabIndex={isMenuOpen ? 0 : -1} key={href}>
                <span className="mobile-menu-label">{label}</span>
              </Link>
            ))}
          </nav>
          <div className="mobile-language-links">{locales.map((targetLocale) => <Link className="mobile-menu-language" href={getLocalizedPath(pathname, targetLocale)} hrefLang={localeConfig[targetLocale].hrefLang} aria-current={locale === targetLocale ? "page" : undefined} onClick={closeMenu} tabIndex={isMenuOpen ? 0 : -1} key={targetLocale}>{localeConfig[targetLocale].label}</Link>)}</div>
        </aside>
      </div>
    </header>
  );
}
