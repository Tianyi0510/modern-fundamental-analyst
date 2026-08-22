"use client";

import Link from "next/link";
import { Check, ChevronDown, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getLocalizedPath, localeConfig, locales, type Locale } from "@/lib/i18n";

type SiteHeaderProps = {
  locale?: Locale;
};

const navigationCopy = {
  en: { home: "Home", about: "About", portfolio: "Portfolio", performance: "Performance", memos: "Investment Memos", contact: "Contact", open: "Open menu", close: "Close menu", change: "Change language", primary: "Primary navigation", mobilePrimary: "Mobile primary navigation", siteMenu: "Site menu", menu: "Menu" },
  "zh-tw": { home: "首頁", about: "關於", portfolio: "投資組合", performance: "績效", memos: "投資備忘錄", contact: "聯絡", open: "開啟目錄", close: "關閉目錄", change: "切換語言", primary: "主要導覽", mobilePrimary: "手機版主要導覽", siteMenu: "網站目錄", menu: "目錄" },
  "zh-cn": { home: "首页", about: "关于", portfolio: "投资组合", performance: "业绩", memos: "投资备忘录", contact: "联系", open: "打开目录", close: "关闭目录", change: "切换语言", primary: "主要导航", mobilePrimary: "手机版主要导航", siteMenu: "网站目录", menu: "目录" },
} as const;

export function SiteHeader({ locale = "en" }: SiteHeaderProps = {}) {
  const prefix = localeConfig[locale].prefix;
  const pathname = usePathname();
  const copy = navigationCopy[locale];
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const languageMenuRef = useRef<HTMLDivElement>(null);
  const languageButtonRef = useRef<HTMLButtonElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuDrawerRef = useRef<HTMLElement>(null);
  const menuCloseButtonRef = useRef<HTMLButtonElement>(null);
  const menuLabel = copy.open;
  const closeLabel = copy.close;

  useEffect(() => {
    if (!isMenuOpen) return;

    const previousOverflow = document.documentElement.style.overflow;
    const menuButton = menuButtonRef.current;
    const handleMenuKeyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = menuDrawerRef.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.documentElement.style.overflow = "hidden";
    menuCloseButtonRef.current?.focus();
    window.addEventListener("keydown", handleMenuKeyboard);

    return () => {
      document.documentElement.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleMenuKeyboard);
      menuButton?.focus();
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isLanguageOpen) return;

    const closeLanguageMenu = (event: MouseEvent) => {
      if (!languageMenuRef.current?.contains(event.target as Node)) setIsLanguageOpen(false);
    };
    const handleLanguageKeyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsLanguageOpen(false);
        languageButtonRef.current?.focus();
        return;
      }

      if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
      const items = Array.from(languageMenuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
      if (!items.length) return;
      event.preventDefault();
      const currentIndex = items.indexOf(document.activeElement as HTMLElement);
      const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : event.key === "ArrowDown" ? (currentIndex + 1) % items.length : (currentIndex - 1 + items.length) % items.length;
      items[nextIndex].focus();
    };

    document.addEventListener("pointerdown", closeLanguageMenu);
    window.addEventListener("keydown", handleLanguageKeyboard);

    return () => {
      document.removeEventListener("pointerdown", closeLanguageMenu);
      window.removeEventListener("keydown", handleLanguageKeyboard);
    };
  }, [isLanguageOpen]);

  const closeMenu = () => setIsMenuOpen(false);

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
        onClick={() => setIsMenuOpen(true)}
      >
        <Menu aria-hidden="true" strokeWidth={2} />
      </button>
      <div className="header-actions">
        <nav aria-label={copy.primary}>
          <Link href={prefix || "/"}>{copy.home}</Link>
          <Link href={`${prefix}/about`}>{copy.about}</Link>
          <Link href={`${prefix}/portfolio`}>{copy.portfolio}</Link>
          <Link href={`${prefix}/performance`}>{copy.performance}</Link>
          <Link href={`${prefix}/memos`}>{copy.memos}</Link>
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
            onClick={() => setIsLanguageOpen(!isLanguageOpen)}
            onKeyDown={(event) => {
              if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
              event.preventDefault();
              setIsLanguageOpen(true);
              requestAnimationFrame(() => {
                const items = languageMenuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]');
                const targetIndex = event.key === "ArrowDown" ? 0 : (items?.length ?? 1) - 1;
                items?.[targetIndex]?.focus();
              });
            }}
          >
            {localeConfig[locale].label}
            <ChevronDown aria-hidden="true" strokeWidth={2} />
          </button>
          <div className={`language-dropdown${isLanguageOpen ? " is-open" : ""}`} id="desktop-language-menu" role="menu" aria-hidden={!isLanguageOpen}>
            {locales.map((targetLocale) => <Link href={getLocalizedPath(pathname, targetLocale)} hrefLang={localeConfig[targetLocale].hrefLang} role="menuitem" aria-current={locale === targetLocale ? "page" : undefined} tabIndex={isLanguageOpen ? 0 : -1} onClick={() => setIsLanguageOpen(false)} key={targetLocale}>
              <span>{localeConfig[targetLocale].label}</span>
              {locale === targetLocale && <Check aria-hidden="true" strokeWidth={2.25} />}
            </Link>)}
          </div>
        </div>
        <Link className="button button-dark button-small" href={`${prefix}/contact`}>
          {copy.contact}
        </Link>
      </div>

      <div className={`mobile-menu-layer${isMenuOpen ? " is-open" : ""}`} aria-hidden={!isMenuOpen}>
        <button className="mobile-menu-backdrop" type="button" aria-label={closeLabel} onClick={closeMenu} tabIndex={isMenuOpen ? 0 : -1} />
        <aside ref={menuDrawerRef} className="mobile-menu-drawer" id="mobile-site-menu" role="dialog" aria-modal="true" aria-label={copy.siteMenu}>
          <div className="mobile-menu-top">
            <span className="mobile-menu-title">{copy.menu}</span>
            <button ref={menuCloseButtonRef} className="mobile-menu-close" type="button" aria-label={closeLabel} onClick={closeMenu} tabIndex={isMenuOpen ? 0 : -1}>
              <X aria-hidden="true" strokeWidth={2} />
            </button>
          </div>
          <nav aria-label={copy.mobilePrimary}>
            <Link href={prefix || "/"} onClick={closeMenu} tabIndex={isMenuOpen ? 0 : -1}>{copy.home}</Link>
            <Link href={`${prefix}/about`} onClick={closeMenu} tabIndex={isMenuOpen ? 0 : -1}>{copy.about}</Link>
            <Link href={`${prefix}/portfolio`} onClick={closeMenu} tabIndex={isMenuOpen ? 0 : -1}>{copy.portfolio}</Link>
            <Link href={`${prefix}/performance`} onClick={closeMenu} tabIndex={isMenuOpen ? 0 : -1}>{copy.performance}</Link>
            <Link href={`${prefix}/memos`} onClick={closeMenu} tabIndex={isMenuOpen ? 0 : -1}>{copy.memos}</Link>
            <Link href={`${prefix}/contact`} onClick={closeMenu} tabIndex={isMenuOpen ? 0 : -1}>{copy.contact}</Link>
          </nav>
          <div className="mobile-language-links">{locales.filter((targetLocale) => targetLocale !== locale).map((targetLocale) => <Link className="mobile-menu-language" href={getLocalizedPath(pathname, targetLocale)} hrefLang={localeConfig[targetLocale].hrefLang} onClick={closeMenu} tabIndex={isMenuOpen ? 0 : -1} key={targetLocale}>{localeConfig[targetLocale].label}</Link>)}</div>
        </aside>
      </div>
    </header>
  );
}
