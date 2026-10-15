"use client";

import { appearance } from "./site-header.styles";
import dynamic from "next/dynamic";

import Link from "next/link";
import {
  BookOpen,
  ChartNoAxesCombined,
  ChartPie,
  ChevronDown,
  Globe,
  House,
  Mail,
  Menu,
  UserRound,
  X,
} from "lucide-react";
import { useRef, type MouseEvent } from "react";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "./ui/sheet";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar";
import { usePathname } from "next/navigation";
import { AnimatedDisclosure } from "@/components/animated-disclosure";
import { useMobileMenu } from "./use-site-header";
import { useMenuTouchFeedback } from "./use-menu-touch-feedback";
import { getLocalizedPath, localeConfig, locales, type Locale } from "@/lib/i18n";
import type { NavigationCopy } from "@/lib/navigation-copy";

const DesktopNavigation = dynamic(() => import("./site-header-desktop").then((module) => module.DesktopNavigation));

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
  const closeForNavigation = (event: MouseEvent<HTMLAnchorElement>) => {
    const destination = new URL(event.currentTarget.href);
    const changesPage = destination.pathname !== pathname || destination.search !== window.location.search;
    const opensElsewhere = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
    navigationClosingRef.current = changesPage && !opensElsewhere;
    closeMenuForNavigation();
  };
  const { attachClose, ...menuTouchFeedback } = useMenuTouchFeedback(menuButtonRef, menuCloseButtonRef);
  const menuLabel = copy.open;
  const closeLabel = copy.close;
  const homePath = getLocalizedPath("/", locale);
  const navigation = [
    { href: homePath, label: copy.home, icon: House },
    { href: getLocalizedPath("/about", locale), label: copy.about, icon: UserRound },
    { href: getLocalizedPath("/portfolio", locale), label: copy.portfolio, icon: ChartPie },
    { href: getLocalizedPath("/performance", locale), label: copy.performance, icon: ChartNoAxesCombined },
    { href: getLocalizedPath("/memos", locale), label: copy.memos, icon: BookOpen },
  ];
  const mobileNavigation = [
    ...navigation,
    { href: getLocalizedPath("/contact", locale), label: copy.contact, icon: Mail },
  ];
  const isCurrentPath = (href: string) => pathname === href || (href !== homePath && pathname.startsWith(`${href}/`));

  return (
    <Sheet
      open={isMenuOpen}
      onOpenChange={(open, details) => {
        if (open || details.reason === "trigger-press") openMenu();
        else if (details.reason === "escape-key" && menuPhase === "closing") closeMenuForNavigation();
        else closeMenu();
      }}
    >
      <header className={appearance["site-header"] + " " + appearance["shell"]}>
        <Link
          className={appearance["wordmark"]}
          href={getLocalizedPath("/", locale)}
          aria-label={`Modern Fundamental Analyst ${copy.home}`}
          tabIndex={isMenuOpen ? -1 : undefined}
        >
          Modern Fundamental Analyst<span>.</span>
        </Link>
        <SheetTrigger
          onClick={() => {
            navigationClosingRef.current = false;
          }}
          render={
            <button
              ref={menuButtonRef}
              className={appearance["mobile-menu-button"]}
              type="button"
              aria-label={menuLabel}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-site-menu"
              tabIndex={isMenuOpen ? -1 : undefined}
              inert={isMenuOpen}
              {...menuTouchFeedback}
            />
          }
        >
          <span className={appearance["mobile-menu-touch-ring"]} aria-hidden="true" />
          <Menu aria-hidden="true" strokeWidth={2} />
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
          initialFocus={menuCloseButtonRef}
          finalFocus={() => (navigationClosingRef.current ? false : menuButtonRef.current)}
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
            <SheetClose
              render={
                <button
                  ref={attachClose}
                  className={appearance["mobile-menu-close"]}
                  type="button"
                  aria-label={closeLabel}
                  {...menuTouchFeedback}
                  tabIndex={isMenuOpen ? 0 : -1}
                />
              }
            >
              <span className={appearance["mobile-menu-touch-ring"]} aria-hidden="true" />
              <X className={appearance["mobile-menu-close-icon"]} aria-hidden="true" strokeWidth={2} />
              <Menu className={appearance["mobile-menu-return-icon"]} aria-hidden="true" strokeWidth={2} />
            </SheetClose>
          </div>
          <div className={appearance["mobile-menu-content"]} ref={menuContentRef} inert={menuPhase === "closing"}>
            <nav className="relative z-[1] shrink-0" aria-label={copy.mobilePrimary}>
              <SidebarMenu>
                {mobileNavigation.map(({ href, label, icon: Icon }) => {
                  const isActive = isCurrentPath(href);
                  return (
                    <SidebarMenuItem key={href}>
                      <SidebarMenuButton
                        isActive={isActive}
                        render={
                          <Link
                            href={href}
                            aria-current={isActive ? "page" : undefined}
                            onClick={closeForNavigation}
                            tabIndex={isMenuOpen ? 0 : -1}
                          />
                        }
                      >
                        <Icon aria-hidden="true" strokeWidth={1.75} />
                        <span className="mobile-menu-label">{label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </nav>
            <div className={appearance["mobile-language-links"]}>
              <AnimatedDisclosure
                className={appearance["mobile-language-disclosure"]}
                summary={
                  <>
                    <span className="inline-flex min-w-0 items-center gap-[var(--space-3)]">
                      <Globe aria-hidden="true" strokeWidth={1.75} />
                      <span>{localeConfig[locale].label}</span>
                    </span>
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
