import Link from "next/link";
import { localeConfig, type Locale } from "@/lib/i18n";
import { SubscribeForm } from "@/components/subscribe-form";

type SiteFooterProps = { locale?: Locale };
const currentYear = new Date().getUTCFullYear();

export function SiteFooter({ locale = "en" }: SiteFooterProps = {}) {
  const prefix = localeConfig[locale].prefix;
  const copy = locale === "zh-tw"
    ? { description: "獨立研究、透明思考、長期視角。", quickLinks: "快速連結", contact: "聯絡", disclaimer: "免責聲明", rights: "版權所有。" }
    : locale === "zh-cn"
      ? { description: "独立研究、透明思考、长期视角。", quickLinks: "快速链接", contact: "联系", disclaimer: "免责声明", rights: "版权所有。" }
      : { description: "Independent research. Transparent thinking. Long-term orientation.", quickLinks: "Quick Links", contact: "Contact", disclaimer: "Disclaimer", rights: "All rights reserved." };

  return (
    <footer className="site-footer shell">
      <div className="footer-brand">
        <Link className="wordmark footer-mark" href={prefix || "/"}>Modern Fundamental Analyst<span>.</span></Link>
        <p>{copy.description}</p>
      </div>
      <nav className="footer-navigation" aria-label={copy.quickLinks}>
        <p className="footer-heading">{copy.quickLinks}</p>
        <div className="footer-links">
          <Link href={`${prefix}/contact`}>{copy.contact}</Link>
          <Link href={`${prefix}/disclaimer`}>{copy.disclaimer}</Link>
          <a className="footer-github" href="https://github.com/Tianyi0510/modern-fundamental-analyst" target="_blank" rel="noreferrer">
            <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 .7a11.5 11.5 0 0 0-3.64 22.41c.58.11.79-.25.79-.56v-2.23c-3.22.7-3.9-1.37-3.9-1.37-.52-1.34-1.29-1.69-1.29-1.69-1.05-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.72 1.27 3.38.97.1-.75.4-1.27.74-1.56-2.57-.29-5.27-1.28-5.27-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.47.11-3.05 0 0 .96-.31 3.16 1.18A10.9 10.9 0 0 1 12 6.13c.98 0 1.94.13 2.86.39 2.2-1.49 3.16-1.18 3.16-1.18.62 1.58.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.41-2.71 5.38-5.29 5.67.42.36.79 1.07.79 2.16v3.24c0 .31.21.68.8.56A11.5 11.5 0 0 0 12 .7Z" /></svg>
            <span>GitHub</span>
          </a>
        </div>
      </nav>
      <SubscribeForm locale={locale} />
      <div className="footer-bottom">
        <small>© {currentYear} Modern Fundamental Analyst. {copy.rights}</small>
      </div>
    </footer>
  );
}
