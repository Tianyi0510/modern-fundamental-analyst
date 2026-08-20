import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = { title: "Contact", description: "Contact Modern Fundamental Analyst about investment research and professional conversations." };

export default function ContactPage() {
  return <main><SiteHeader />
    <section className="page-hero contact-hero shell"><p className="eyebrow"><span /> Contact</p><h1>Start a thoughtful<br /><em>conversation.</em></h1><p className="contact-note">Contact details and the Resend-powered form will be connected before launch.</p></section>
    <section className="contact-grid shell"><div><span>Research</span><p>Questions, constructive disagreement, and long-term ideas are welcome.</p></div><div><span>Professional</span><p>For collaborations and other professional enquiries.</p></div></section><SiteFooter /></main>;
}
