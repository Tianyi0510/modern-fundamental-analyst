import Link from "next/link";

type SiteFooterProps = { locale?: "en" | "zh-tw" };

export function SiteFooter({ locale = "en" }: SiteFooterProps = {}) {
  const isChinese = locale === "zh-tw";
  const prefix = isChinese ? "/zh-tw" : "";

  return (
    <footer className="site-footer shell">
      <Link className="wordmark footer-mark" href={prefix || "/"}>Modern Fundamental Analyst<span>.</span></Link>
      <p>{isChinese ? "獨立研究、透明思考、長期視角。" : "Independent research. Transparent thinking. Long-term orientation."}</p>
      <div className="footer-links">
        <Link href={`${prefix}/contact`}>{isChinese ? "聯絡" : "Contact"}</Link>
        <Link href={`${prefix}/disclaimer`}>{isChinese ? "免責聲明" : "Disclaimer"}</Link>
      </div>
      <small>© 2026 Modern Fundamental Analyst. {isChinese ? "版權所有。" : "All rights reserved."}</small>
    </footer>
  );
}
