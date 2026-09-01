import Link from "next/link";
import { localeConfig, type Locale } from "@/lib/i18n";
import { SubscribeForm } from "@/components/subscribe-form";

type SiteFooterProps = { locale?: Locale };
const currentYear = new Date().getUTCFullYear();

export function SiteFooter({ locale = "en" }: SiteFooterProps = {}) {
  const prefix = localeConfig[locale].prefix;
  const copy = locale === "zh-tw"
    ? { description: "獨立研究、透明思考、長期視角。", quickLinks: "快速連結", contact: "聯絡", support: "支持研究", disclaimer: "免責聲明", rights: "版權所有。" }
    : locale === "zh-cn"
      ? { description: "独立研究、透明思考、长期视角。", quickLinks: "快速链接", contact: "联系", support: "支持研究", disclaimer: "免责声明", rights: "版权所有。" }
      : { description: "Independent research. Transparent thinking. Long-term orientation.", quickLinks: "Quick Links", contact: "Contact", support: "Support", disclaimer: "Disclaimer", rights: "All rights reserved." };

  return (
    <footer className="site-footer shell">
      <div className="footer-main">
        <div className="footer-brand">
          <Link className="wordmark footer-mark" href={prefix || "/"}>Modern Fundamental Analyst<span>.</span></Link>
          <p>{copy.description}</p>
        </div>
        <nav className="footer-navigation" aria-label={copy.quickLinks}>
          <p className="footer-heading">{copy.quickLinks}</p>
          <div className="footer-links">
            <Link href={`${prefix}/contact`}>{copy.contact}</Link>
            <Link href={`${prefix}/support`}>{copy.support}</Link>
            <Link href={`${prefix}/disclaimer`}>{copy.disclaimer}</Link>
            <a className="footer-social-link footer-github" href="https://github.com/Tianyi0510/modern-fundamental-analyst" target="_blank" rel="noreferrer">
              <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 .7a11.5 11.5 0 0 0-3.64 22.41c.58.11.79-.25.79-.56v-2.23c-3.22.7-3.9-1.37-3.9-1.37-.52-1.34-1.29-1.69-1.29-1.69-1.05-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.72 1.27 3.38.97.1-.75.4-1.27.74-1.56-2.57-.29-5.27-1.28-5.27-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.47.11-3.05 0 0 .96-.31 3.16 1.18A10.9 10.9 0 0 1 12 6.13c.98 0 1.94.13 2.86.39 2.2-1.49 3.16-1.18 3.16-1.18.62 1.58.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.41-2.71 5.38-5.29 5.67.42.36.79 1.07.79 2.16v3.24c0 .31.21.68.8.56A11.5 11.5 0 0 0 12 .7Z" /></svg>
              <span>GitHub</span>
            </a>
            <a className="footer-social-link footer-linkedin" href="https://www.linkedin.com/in/tianyi-li-modern-fundamental-analyst/" target="_blank" rel="noreferrer">
              <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V8.98h3.42v1.57h.05c.47-.9 1.64-1.85 3.37-1.85 3.61 0 4.27 2.37 4.27 5.46v6.29ZM5.32 7.41a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12Zm1.78 13.04H3.54V8.98H7.1v11.47ZM22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.21 0 22.23 0Z" /></svg>
              <span>LinkedIn</span>
            </a>
            <a className="footer-social-link footer-x" href="https://x.com/DavidLi0510" target="_blank" rel="noreferrer">
              <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117Z" /></svg>
              <span>X (formerly Twitter)</span>
            </a>
          </div>
        </nav>
        <SubscribeForm locale={locale} />
      </div>
      <div className="footer-bottom">
        <small>© {currentYear} Modern Fundamental Analyst. {copy.rights}</small>
      </div>
    </footer>
  );
}
