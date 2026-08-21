"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

type SiteHeaderProps = {
  locale?: "en" | "zh-tw";
  counterpartPath?: string;
};

export function SiteHeader({ locale = "en", counterpartPath }: SiteHeaderProps = {}) {
  const isChinese = locale === "zh-tw";
  const prefix = isChinese ? "/zh-tw" : "";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuLabel = isChinese ? "開啟目錄" : "Open menu";
  const closeLabel = isChinese ? "關閉目錄" : "Close menu";

  useEffect(() => {
    if (!isMenuOpen) return;

    const previousOverflow = document.documentElement.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };

    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.documentElement.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="site-header shell">
      <Link className="wordmark" href={prefix || "/"} aria-label={isChinese ? "Modern Fundamental Analyst 首頁" : "Modern Fundamental Analyst home"}>
        Modern Fundamental Analyst<span>.</span>
      </Link>
      <button
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
        <Link className="language-link" href={counterpartPath ?? (isChinese ? "/" : "/zh-tw")} hrefLang={isChinese ? "en" : "zh-Hant-TW"}>
          {isChinese ? "EN" : "繁體中文"}
        </Link>
        <Link className="button button-dark button-small" href={`${prefix}/contact`}>
          {isChinese ? "聯絡" : "Contact"}
        </Link>
      </div>

      <div className={`mobile-menu-layer${isMenuOpen ? " is-open" : ""}`} aria-hidden={!isMenuOpen}>
        <button className="mobile-menu-backdrop" type="button" aria-label={closeLabel} onClick={closeMenu} tabIndex={isMenuOpen ? 0 : -1} />
        <aside className="mobile-menu-drawer" id="mobile-site-menu" aria-label={isChinese ? "網站目錄" : "Site menu"}>
          <div className="mobile-menu-top">
            <span className="mobile-menu-title">{isChinese ? "目錄" : "Menu"}</span>
            <button className="mobile-menu-close" type="button" aria-label={closeLabel} onClick={closeMenu} tabIndex={isMenuOpen ? 0 : -1}>
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
          <Link className="mobile-menu-language" href={counterpartPath ?? (isChinese ? "/" : "/zh-tw")} hrefLang={isChinese ? "en" : "zh-Hant-TW"} onClick={closeMenu} tabIndex={isMenuOpen ? 0 : -1}>
            {isChinese ? "English" : "繁體中文"}
          </Link>
        </aside>
      </div>
    </header>
  );
}
