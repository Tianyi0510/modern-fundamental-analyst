import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { memos } from "@/data/site";
import { createPageMetadata } from "@/lib/site-config";
import { formatDate } from "@/lib/format";

export const metadata = createPageMetadata({ title: "Investment Memos", description: "Long-form notes on business quality, valuation, risk, and capital allocation.", path: "/memos" });

export default function MemosPage() {
  return <main className="memos-page"><SiteHeader />
    <section className="page-hero shell"><p className="eyebrow"><span /> Investment Memos</p><h1>Detailed Theses for<br /><em>Independent Investor Evaluation.</em></h1></section>
    <section className="memo-index shell">{memos.map((memo) => <Link href={`/memos/${memo.slug}`} className="memo-index-row" key={memo.slug}><span>{memo.number}</span><div><small>{memo.tag}</small><h2>{memo.title}</h2><p>{memo.summary}</p></div><div className="memo-meta"><span>{formatDate(memo.publishedAt, "en", true)}</span><span>{memo.readTime}</span><b className="arrow-icon" aria-hidden="true">↗︎</b></div></Link>)}</section>
    <SiteFooter /></main>;
}
