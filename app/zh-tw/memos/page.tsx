import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { memosZhTw } from "@/data/site-zh-tw";

export const metadata: Metadata = { title: { absolute: "投資札記｜Modern Fundamental Analyst" }, description: "關於企業品質、估值、風險與資本配置的長篇研究。" };

export default function MemosPageZhTw() {
  return <main><SiteHeader locale="zh-tw" counterpartPath="/memos" />
    <section className="page-hero shell"><p className="eyebrow"><span /> 投資札記</p><h1>讓思考，<br /><em>清楚可見。</em></h1></section>
    <section className="memo-index shell">{memosZhTw.map((memo) => <Link href={`/zh-tw/memos/${memo.slug}`} className="memo-index-row" key={memo.slug}><span>{memo.number}</span><div><small>{memo.tag}</small><h2>{memo.title}</h2><p>{memo.summary}</p></div><div className="memo-meta"><span>{memo.date}</span><span>{memo.readTime}</span><b>↗</b></div></Link>)}</section>
    <SiteFooter locale="zh-tw" /></main>;
}
