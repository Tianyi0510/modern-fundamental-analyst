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
        </div>
      </nav>
      <SubscribeForm locale={locale} />
      <div className="footer-bottom">
        <small>© {currentYear} Modern Fundamental Analyst. {copy.rights}</small>
      </div>
    </footer>
  );
}
