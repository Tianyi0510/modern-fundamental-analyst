"use client";

import Link from "next/link";
import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ButtonLink } from "./button-link";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { appearance, desktopNavigationLink, languageChoice } from "./site-header.styles";
import { getLocalizedPath, localeConfig, locales, type Locale } from "@/lib/i18n";
import type { NavigationCopy } from "@/lib/navigation-copy";

type DesktopNavigationProps = {
  copy: NavigationCopy;
  locale: Locale;
  languageQuery: string;
  navigation: readonly { href: string; label: string }[];
};

export function DesktopNavigation({ copy, locale, languageQuery, navigation }: DesktopNavigationProps) {
  const pathname = usePathname();
  const homePath = getLocalizedPath("/", locale);
  const isCurrentPath = (href: string) => pathname === href || (href !== homePath && pathname.startsWith(`${href}/`));
  const [isLanguageOpen, setLanguageOpen] = useState(false);
  const languageTriggerRef = useRef<HTMLButtonElement>(null);
  const languageContentRef = useRef<HTMLDivElement>(null);
  const contactLinkRef = useRef<HTMLAnchorElement>(null);
  const enterLastLanguageRef = useRef(false);
  const languageTabExitRef = useRef(false);
  useEffect(() => {
    const compact = window.matchMedia("(max-width: 1150px)");
    const closeDesktopMenu = () => {
      if (compact.matches) setLanguageOpen(false);
    };
    compact.addEventListener("change", closeDesktopMenu);
    return () => compact.removeEventListener("change", closeDesktopMenu);
  }, []);

  return (
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
  );
}
