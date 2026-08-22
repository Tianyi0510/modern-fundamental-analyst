import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({ title: "Contact", description: "Contact Modern Fundamental Analyst about investment research and professional conversations.", path: "/contact" });

export default function ContactPage() {
  return <main className="contact-page"><SiteHeader counterpartPath="/zh-tw/contact" />
    <section className="page-hero contact-hero shell"><p className="eyebrow"><span /> Contact</p><h1>Connect Through Research,<br /><em>Ideas, and Opportunities.</em></h1><p className="contact-note">Reach out to discuss investment research, financial modeling, business opportunities, or ideas that empower retail investors.</p></section>
    <section className="contact-grid shell"><div><span>Research</span><p>Share feedback, challenge my assumptions, or discuss detailed investment theses, valuation methods, and portfolio decisions.</p></div><div><span>Business</span><p>Contact me about internships, collaborations, tutoring, financial modeling projects, or other professional opportunities across finance.</p></div></section><SiteFooter /></main>;
}
