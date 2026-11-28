"use client";

import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink } from "../ui/navigation-menu";
import { ThemeToggle } from "../theme-toggle";
import { IntentLink as Link } from "../intent-link";
import { Check, ChevronDown } from "lucide-react";
import { useRef, useState, type RefObject } from "react";
import { usePathname } from "next/navigation";
import { ButtonLink } from "../button-link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { appearance, desktopNavigationLink, languageChoice } from "./site-header.styles";
import { getLocalizedPath, localeConfig, locales, type Locale } from "@/lib/i18n";
import type { NavigationCopy } from "@/lib/navigation-copy";

type DesktopNavigationProps = {
  actionsRef: RefObject<HTMLDivElement | null>;
  compact: boolean;
  copy: NavigationCopy;
  locale: Locale;
  languageQuery: string;
  navigation: readonly { href: string; label: string }[];
};

export function DesktopNavigation({
  actionsRef,
  compact,
  copy,
  locale,
  languageQuery,
  navigation,
}: DesktopNavigationProps) {
  const pathname = usePathname();
  const homePath = getLocalizedPath("/", locale);
  const isCurrentPath = (href: string) => pathname === href || (href !== homePath && pathname.startsWith(`${href}/`));
  const [isLanguageOpen, setLanguageOpen] = useState(false);
  const languageTriggerRef = useRef<HTMLButtonElement>(null);
  const appearanceRef = useRef<HTMLButtonElement>(null);
  const skipLanguageReturnFocusRef = useRef(false);
  if (compact && isLanguageOpen) setLanguageOpen(false);

  return (
    <div ref={actionsRef} inert={compact} className={appearance["header-actions"]}>
      <NavigationMenu aria-label={copy.primary}>
        <NavigationMenuList className="gap-[var(--space-8px)]">
          {navigation.map(({ href, label }) => (
            <NavigationMenuItem key={href}>
              <NavigationMenuLink
                variant="plain"
                active={isCurrentPath(href)}
                className={`${desktopNavigationLink} text-medium-label`}
                render={<Link href={href} aria-current={isCurrentPath(href) ? "page" : undefined} />}
              >
                {label}
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
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
      <ThemeToggle locale={locale} buttonRef={appearanceRef} />
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
