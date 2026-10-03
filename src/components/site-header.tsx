"use client";

import { appearance, mobileNavigationLink } from "./site-header.styles";
import { DesktopNavigation } from "./site-header-desktop";

import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { useRef } from "react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "./ui/sheet";
import { usePathname } from "next/navigation";
import { AnimatedDisclosure } from "@/components/animated-disclosure";
import { useMobileMenu } from "./use-site-header";
import { useMenuTouchFeedback } from "./use-menu-touch-feedback";
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
    attachContent: menuContentRef,
    drawerRef: menuDrawerRef,
    handlePointerCancel: handleMenuPointerCancel,
    handlePointerDown: handleMenuPointerDown,
    handlePointerUp: handleMenuPointerUp,
    isOpen: isMenuOpen,
    phase: menuPhase,
    open: openMenu,
    triggerRef: menuButtonRef,
  } = useMobileMenu();
  const navigationClosingRef = useRef(false);
  const closeForNavigation = () => {
    navigationClosingRef.current = true;
    closeMenuForNavigation();
  };
  const { attachClose, ...menuTouchFeedback } = useMenuTouchFeedback(menuButtonRef, menuCloseButtonRef);
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
    <Sheet open={isMenuOpen} onOpenChange={(open) => (open ? openMenu() : closeMenu())}>
      <header className={appearance["site-header"] + " " + appearance["shell"]}>
        <Link
          className={appearance["wordmark"]}
          href={getLocalizedPath("/", locale)}
          aria-label={`Modern Fundamental Analyst ${copy.home}`}
          tabIndex={isMenuOpen ? -1 : undefined}
        >
          Modern Fundamental Analyst<span>.</span>
        </Link>
        <SheetTrigger asChild>
          <button
            ref={menuButtonRef}
            className={appearance["mobile-menu-button"]}
            type="button"
            aria-label={menuLabel}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-site-menu"
            tabIndex={isMenuOpen ? -1 : undefined}
            {...menuTouchFeedback}
            onClick={(event) => {
              event.preventDefault();
              navigationClosingRef.current = false;
              openMenu();
            }}
          >
            <span className={appearance["mobile-menu-touch-ring"]} aria-hidden="true" />
            <Menu aria-hidden="true" strokeWidth={2} />
          </button>
        </SheetTrigger>
        <DesktopNavigation copy={copy} locale={locale} languageQuery={languageQuery} navigation={navigation} />

        <SheetContent
          ref={menuDrawerRef}
          layerClassName={appearance["mobile-menu-layer"]}
          phase={menuPhase}
          className={appearance["mobile-menu-drawer"]}
          id="mobile-site-menu"
          aria-modal="true"
          aria-describedby={undefined}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            menuCloseButtonRef.current?.focus({ preventScroll: true });
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (!navigationClosingRef.current) menuButtonRef.current?.focus({ preventScroll: true });
          }}
          onEscapeKeyDown={(event) => {
            event.preventDefault();
            if (menuPhase === "closing") closeMenuForNavigation();
            else closeMenu();
          }}
          onPointerCancel={handleMenuPointerCancel}
          onPointerDown={handleMenuPointerDown}
          onPointerUp={handleMenuPointerUp}
        >
          <SheetTitle className="sr-only">{copy.siteMenu}</SheetTitle>
          <div className={appearance["mobile-menu-top"]}>
            <Link
              className={appearance["wordmark"] + " " + appearance["mobile-menu-wordmark"]}
              href={homePath}
              onClick={closeForNavigation}
              inert={menuPhase === "closing"}
              tabIndex={isMenuOpen ? 0 : -1}
            >
              Modern Fundamental Analyst<span>.</span>
            </Link>
            <button
              ref={attachClose}
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
          <div className={appearance["mobile-menu-content"]} ref={menuContentRef} inert={menuPhase === "closing"}>
            <nav
              className="relative z-[1] flex flex-col text-[length:var(--font-size-compact-title)] leading-[var(--leading-compact-title)] font-bold tracking-[var(--tracking-heading)]"
              aria-label={copy.mobilePrimary}
            >
              {mobileNavigation.map(({ href, label }) => (
                <Link
                  className={mobileNavigationLink}
                  href={href}
                  aria-current={isCurrentPath(href) ? "page" : undefined}
                  onClick={closeForNavigation}
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
                        onClick={closeForNavigation}
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
        </SheetContent>
      </header>
    </Sheet>
  );
}
