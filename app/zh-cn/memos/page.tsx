import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { memosZhCn } from "@/data/site-zh-cn";
import { formatDate } from "@/lib/format";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({ title: "投资备忘录", description: "关于企业质量、估值、风险与资本配置的长篇研究。", path: "/memos", locale: "zh-cn" });

export default function MemosPageZhCn() {
  return <main className="memos-page"><SiteHeader locale="zh-cn" />
    <section className="page-hero shell"><p className="eyebrow"><span /> 投资备忘录</p><h1>供独立投资者评估的<br /><em>详细投资论点。</em></h1></section>
    <section className="memo-index shell">{memosZhCn.map((memo) => <Link href={`/zh-cn/memos/${memo.slug}`} className="memo-index-row" key={memo.slug}><span>{memo.number}</span><div><small>{memo.tag}</small><h2>{memo.title}</h2><p>{memo.summary}</p></div><div className="memo-meta"><span>{formatDate(memo.publishedAt, "zh-cn")}</span><span>{memo.readTime}</span><b className="arrow-icon" aria-hidden="true">↗︎</b></div></Link>)}</section>
    <SiteFooter locale="zh-cn" /></main>;
}
