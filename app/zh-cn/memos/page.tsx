import { MemoIndex } from "@/components/memo-index";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { memosZhCn } from "@/data/site-zh-cn";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({ title: "投资备忘录", description: "关于企业质量、估值、风险与资本配置的长篇研究。", path: "/memos", locale: "zh-cn" });

export default function MemosPageZhCn() {
  return <main className="memos-page"><SiteHeader locale="zh-cn" />
    <section className="page-hero shell"><p className="eyebrow"><span /> 投资备忘录</p><h1>供独立投资者评估的<br /><em>详细投资论点。</em></h1></section>
    <MemoIndex memos={memosZhCn} locale="zh-cn" label="查看所有投资备忘录" basePath="/zh-cn/memos" />
    <SiteFooter locale="zh-cn" /></main>;
}
