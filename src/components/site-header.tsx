"use client";

import { appearance, desktopNavigationLink, mobileNavigationLink, languageChoice } from "./site-header.styles";
import { ButtonLink } from "./button-link";

import Link from "next/link";
import { Check, ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "./ui/sheet";
import { usePathname } from "next/navigation";
import { AnimatedDisclosure } from "@/components/animated-disclosure";
import { useMenuTouchFeedback, useMobileMenu } from "@/components/use-site-header";
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
  const [isLanguageOpen, setLanguageOpen] = useState(false);
  const languageTriggerRef = useRef<HTMLButtonElement>(null);
  const languageContentRef = useRef<HTMLDivElement>(null);
  const contactLinkRef = useRef<HTMLAnchorElement>(null);
  const enterLastLanguageRef = useRef(false);
  const languageTabExitRef = useRef(false);
  const navigationClosingRef = useRef(false);
  useEffect(() => {
    const compact = window.matchMedia("(max-width: 1150px)");
    const closeDesktopMenu = () => {
      if (compact.matches) setLanguageOpen(false);
    };
    compact.addEventListener("change", closeDesktopMenu);
    return () => compact.removeEventListener("change", closeDesktopMenu);
  }, []);
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
          <div className={appearance["language-menu"]}>
            <DropdownMenu modal={false} open={isLanguageOpen} onOpenChange={setLanguageOpen}>
              <DropdownMenuTrigger
                ref={languageTriggerRef}
                onKeyDown={(event) => {
                  if (event.key !== "ArrowUp" || isLanguageOpen) return;
                  event.preventDefault();
                  enterLastLanguageRef.current = true;
                  setLanguageOpen(true);
                }}
                className={appearance["language-trigger"]}
                aria-label={copy.change}
                aria-controls="desktop-language-menu"
              >
                {localeConfig[locale].label}
                <ChevronDown aria-hidden="true" strokeWidth={2.75} />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                ref={languageContentRef}
                className="language-dropdown"
                align="end"
                id="desktop-language-menu"
                onFocusCapture={() => {
                  if (!enterLastLanguageRef.current) return;
                  enterLastLanguageRef.current = false;
                  requestAnimationFrame(() =>
                    languageContentRef.current?.querySelector<HTMLElement>("[role=menuitem]:last-child")?.focus(),
                  );
                }}
                onKeyDown={(event) => {
                  if (event.key !== "Tab") return;
                  event.preventDefault();
                  languageTabExitRef.current = true;
                  setLanguageOpen(false);
                  (event.shiftKey ? languageTriggerRef.current : contactLinkRef.current)?.focus();
                }}
                onCloseAutoFocus={(event) => {
                  if (languageTabExitRef.current) event.preventDefault();
                  languageTabExitRef.current = false;
                }}
              >
                {locales.map((targetLocale) => (
                  <DropdownMenuItem asChild key={targetLocale}>
                    <Link
                      className={languageChoice}
                      href={`${getLocalizedPath(pathname, targetLocale)}${languageQuery ? `?${languageQuery}` : ""}`}
                      hrefLang={localeConfig[targetLocale].hrefLang}
                      aria-current={locale === targetLocale ? "page" : undefined}
                    >
                      <span>{localeConfig[targetLocale].label}</span>
                      {locale === targetLocale && <Check aria-hidden="true" strokeWidth={2.25} />}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <ButtonLink
            ref={contactLinkRef}
            variant="contrast"
            size="small"
            href={getLocalizedPath("/contact", locale)}
            aria-current={isCurrentPath(getLocalizedPath("/contact", locale)) ? "page" : undefined}
          >
            {copy.contact}
          </ButtonLink>
        </div>

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
