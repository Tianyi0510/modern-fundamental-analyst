import Link from "next/link";

type SiteHeaderProps = {
  locale?: "en" | "zh-tw";
  counterpartPath?: string;
};

export function SiteHeader({ locale = "en", counterpartPath }: SiteHeaderProps = {}) {
  const isChinese = locale === "zh-tw";
  const prefix = isChinese ? "/zh-tw" : "";

  return (
    <header className="site-header shell">
      <Link className="wordmark" href={prefix || "/"} aria-label={isChinese ? "Modern Fundamental Analyst 首頁" : "Modern Fundamental Analyst home"}>
        Modern Fundamental Analyst<span>.</span>
      </Link>
      <div className="header-actions">
        <nav aria-label={isChinese ? "主要導覽" : "Primary navigation"}>
          <Link href={prefix || "/"}>{isChinese ? "首頁" : "Home"}</Link>
          <Link href={`${prefix}/about`}>{isChinese ? "關於" : "About"}</Link>
          <Link href={`${prefix}/portfolio`}>{isChinese ? "投資組合" : "Portfolio"}</Link>
          <Link href={`${prefix}/performance`}>{isChinese ? "績效" : "Performance"}</Link>
          <Link href={`${prefix}/memos`}>{isChinese ? "研究札記" : "Memos"}</Link>
        </nav>
        <Link className="language-link" href={counterpartPath ?? (isChinese ? "/" : "/zh-tw")} hrefLang={isChinese ? "en" : "zh-Hant-TW"}>
          {isChinese ? "EN" : "繁體中文"}
        </Link>
        <Link className="button button-dark button-small" href={`${prefix}/contact`}>
          {isChinese ? "聯絡" : "Contact"}
        </Link>
      </div>
    </header>
  );
}
