"use client";

import Link from "next/link";
import { Check, ChevronDown, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type SiteHeaderProps = {
  locale?: "en" | "zh-tw";
  counterpartPath?: string;
};

export function SiteHeader({ locale = "en", counterpartPath }: SiteHeaderProps = {}) {
  const isChinese = locale === "zh-tw";
  const prefix = isChinese ? "/zh-tw" : "";
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const languageMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuDrawerRef = useRef<HTMLElement>(null);
  const menuCloseButtonRef = useRef<HTMLButtonElement>(null);
  const menuLabel = isChinese ? "開啟目錄" : "Open menu";
  const closeLabel = isChinese ? "關閉目錄" : "Close menu";
  const alternatePath = counterpartPath ?? (isChinese ? "/" : "/zh-tw");

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
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsLanguageOpen(false);
    };

    document.addEventListener("pointerdown", closeLanguageMenu);
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closeLanguageMenu);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isLanguageOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="site-header shell">
      <Link className="wordmark" href={prefix || "/"} aria-label={isChinese ? "Modern Fundamental Analyst 首頁" : "Modern Fundamental Analyst home"}>
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
        <nav aria-label={isChinese ? "主要導覽" : "Primary navigation"}>
          <Link href={prefix || "/"}>{isChinese ? "首頁" : "Home"}</Link>
          <Link href={`${prefix}/about`}>{isChinese ? "關於" : "About"}</Link>
          <Link href={`${prefix}/portfolio`}>{isChinese ? "投資組合" : "Portfolio"}</Link>
          <Link href={`${prefix}/performance`}>{isChinese ? "績效" : "Performance"}</Link>
          <Link href={`${prefix}/memos`}>{isChinese ? "投資備忘錄" : "Investment Memos"}</Link>
        </nav>
        <div className="language-menu" ref={languageMenuRef}>
          <button
            className="language-trigger"
            type="button"
            aria-label={isChinese ? "切換語言" : "Change language"}
            aria-haspopup="menu"
            aria-expanded={isLanguageOpen}
            aria-controls="desktop-language-menu"
            onClick={() => setIsLanguageOpen(!isLanguageOpen)}
          >
            {isChinese ? "繁體中文" : "English"}
            <ChevronDown aria-hidden="true" strokeWidth={2} />
          </button>
          <div className={`language-dropdown${isLanguageOpen ? " is-open" : ""}`} id="desktop-language-menu" role="menu" aria-hidden={!isLanguageOpen}>
            <Link href={isChinese ? alternatePath : pathname} hrefLang="en" role="menuitem" aria-current={!isChinese ? "page" : undefined} tabIndex={isLanguageOpen ? 0 : -1} onClick={() => setIsLanguageOpen(false)}>
              <span>English</span>
              {!isChinese && <Check aria-hidden="true" strokeWidth={2.25} />}
            </Link>
            <Link href={isChinese ? pathname : alternatePath} hrefLang="zh-Hant-TW" role="menuitem" aria-current={isChinese ? "page" : undefined} tabIndex={isLanguageOpen ? 0 : -1} onClick={() => setIsLanguageOpen(false)}>
              <span>繁體中文</span>
              {isChinese && <Check aria-hidden="true" strokeWidth={2.25} />}
            </Link>
          </div>
        </div>
        <Link className="button button-dark button-small" href={`${prefix}/contact`}>
          {isChinese ? "聯絡" : "Contact"}
        </Link>
      </div>

      <div className={`mobile-menu-layer${isMenuOpen ? " is-open" : ""}`} aria-hidden={!isMenuOpen}>
        <button className="mobile-menu-backdrop" type="button" aria-label={closeLabel} onClick={closeMenu} tabIndex={isMenuOpen ? 0 : -1} />
        <aside ref={menuDrawerRef} className="mobile-menu-drawer" id="mobile-site-menu" role="dialog" aria-modal="true" aria-label={isChinese ? "網站目錄" : "Site menu"}>
          <div className="mobile-menu-top">
            <span className="mobile-menu-title">{isChinese ? "目錄" : "Menu"}</span>
            <button ref={menuCloseButtonRef} className="mobile-menu-close" type="button" aria-label={closeLabel} onClick={closeMenu} tabIndex={isMenuOpen ? 0 : -1}>
              <X aria-hidden="true" strokeWidth={2} />
            </button>
          </div>
          <nav aria-label={isChinese ? "手機版主要導覽" : "Mobile primary navigation"}>
            <Link href={prefix || "/"} onClick={closeMenu} tabIndex={isMenuOpen ? 0 : -1}>{isChinese ? "首頁" : "Home"}</Link>
            <Link href={`${prefix}/about`} onClick={closeMenu} tabIndex={isMenuOpen ? 0 : -1}>{isChinese ? "關於" : "About"}</Link>
            <Link href={`${prefix}/portfolio`} onClick={closeMenu} tabIndex={isMenuOpen ? 0 : -1}>{isChinese ? "投資組合" : "Portfolio"}</Link>
            <Link href={`${prefix}/performance`} onClick={closeMenu} tabIndex={isMenuOpen ? 0 : -1}>{isChinese ? "績效" : "Performance"}</Link>
            <Link href={`${prefix}/memos`} onClick={closeMenu} tabIndex={isMenuOpen ? 0 : -1}>{isChinese ? "投資備忘錄" : "Investment Memos"}</Link>
            <Link href={`${prefix}/contact`} onClick={closeMenu} tabIndex={isMenuOpen ? 0 : -1}>{isChinese ? "聯絡" : "Contact"}</Link>
          </nav>
          <Link className="mobile-menu-language" href={alternatePath} hrefLang={isChinese ? "en" : "zh-Hant-TW"} onClick={closeMenu} tabIndex={isMenuOpen ? 0 : -1}>
            {isChinese ? "English" : "繁體中文"}
          </Link>
        </aside>
      </div>
    </header>
  );
}
