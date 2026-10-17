"use client";

import { ThemeSelect } from "./theme-select";
import { IntentLink as Link } from "./intent-link";
import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ButtonLink } from "./button-link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
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
  const appearanceRef = useRef<HTMLSelectElement>(null);
  const skipLanguageReturnFocusRef = useRef(false);
  useEffect(() => {
    const compact = window.matchMedia("(max-width: 1279px)");
    const closeDesktopMenu = () => {
      if (compact.matches) setLanguageOpen(false);
    };
    compact.addEventListener("change", closeDesktopMenu);
    return () => compact.removeEventListener("change", closeDesktopMenu);
  }, []);

  return (
    <div className={appearance["header-actions"]}>
      <nav className="flex gap-[8px] min-[1280px]:gap-[12px]" aria-label={copy.primary}>
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
      <div
        className={appearance["language-menu"]}
        onKeyDownCapture={(event) => {
          if (event.key !== "Tab" || !isLanguageOpen) return;
          event.preventDefault();
          event.stopPropagation();
          skipLanguageReturnFocusRef.current = true;
          setLanguageOpen(false);
          (event.shiftKey ? languageTriggerRef.current : appearanceRef.current)?.focus();
        }}
      >
        <DropdownMenu modal={false} open={isLanguageOpen} onOpenChange={setLanguageOpen}>
          <DropdownMenuTrigger
            ref={languageTriggerRef}
            className={appearance["language-trigger"]}
            aria-label={copy.change}
            aria-controls="desktop-language-menu"
          >
            {localeConfig[locale].label}
            <ChevronDown aria-hidden="true" strokeWidth={2.75} />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="language-dropdown"
            align="end"
            id="desktop-language-menu"
            onBlur={(event) => {
              const destination = event.relatedTarget;
              if (
                !(destination instanceof Node) ||
                event.currentTarget.contains(destination) ||
                destination === languageTriggerRef.current
              )
                return;
              skipLanguageReturnFocusRef.current = true;
              setLanguageOpen(false);
            }}
            finalFocus={() => {
              const restoreTrigger = !skipLanguageReturnFocusRef.current;
              skipLanguageReturnFocusRef.current = false;
              return restoreTrigger;
            }}
          >
            <DropdownMenuGroup>
              {locales.map((targetLocale) => (
                <DropdownMenuItem
                  key={targetLocale}
                  render={
                    <Link
                      className={languageChoice}
                      href={`${getLocalizedPath(pathname, targetLocale)}${languageQuery ? `?${languageQuery}` : ""}`}
                      hrefLang={localeConfig[targetLocale].hrefLang}
                      aria-current={locale === targetLocale ? "page" : undefined}
                    />
                  }
                >
                  <span>{localeConfig[targetLocale].label}</span>
                  {locale === targetLocale && <Check aria-hidden="true" strokeWidth={2.25} />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <ThemeSelect locale={locale} compact selectRef={appearanceRef} />
      <ButtonLink
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
