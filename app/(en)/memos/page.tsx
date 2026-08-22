import { MemoIndex } from "@/components/memo-index";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { memos } from "@/data/site";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({ title: "Investment Memos", description: "Long-form notes on business quality, valuation, risk, and capital allocation.", path: "/memos" });

export default function MemosPage() {
  return <main className="memos-page"><SiteHeader />
    <section className="page-hero shell"><p className="eyebrow"><span /> Investment Memos</p><h1>Detailed Theses for<br /><em>Independent Investor Evaluation.</em></h1></section>
    <MemoIndex memos={memos} locale="en" label="View All Investment Memos" basePath="/memos" />
    <SiteFooter /></main>;
}
