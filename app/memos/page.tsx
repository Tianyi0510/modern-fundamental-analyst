import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { memos } from "@/data/site";

export const metadata: Metadata = { title: "Investment Memos", description: "Long-form notes on business quality, valuation, risk, and capital allocation." };

export default function MemosPage() {
  return <main className="memos-page"><SiteHeader counterpartPath="/zh-tw/memos" />
    <section className="page-hero shell"><p className="eyebrow"><span /> Investment Memos</p><h1>Thinking,<br /><em>made visible.</em></h1></section>
    <section className="memo-index shell">{memos.map((memo) => <Link href={`/memos/${memo.slug}`} className="memo-index-row" key={memo.slug}><span>{memo.number}</span><div><small>{memo.tag}</small><h2>{memo.title}</h2><p>{memo.summary}</p></div><div className="memo-meta"><span>{memo.date}</span><span>{memo.readTime}</span><b className="arrow-icon" aria-hidden="true">↗︎</b></div></Link>)}</section>
    <SiteFooter /></main>;
}
