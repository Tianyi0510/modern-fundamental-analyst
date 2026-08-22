import { MemoIndex } from "@/components/memo-index";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { memosZhTw } from "@/data/site-zh-tw";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({ title: "投資備忘錄", description: "關於企業品質、估值、風險與資本配置的長篇研究。", path: "/memos", locale: "zh-tw" });

export default function MemosPageZhTw() {
  return <main className="memos-page"><SiteHeader locale="zh-tw" />
    <section className="page-hero shell"><p className="eyebrow"><span /> 投資備忘錄</p><h1>供獨立投資者評估的<br /><em>詳細投資論點。</em></h1></section>
    <MemoIndex memos={memosZhTw} locale="zh-tw" label="查看所有投資備忘錄" basePath="/zh-tw/memos" />
    <SiteFooter locale="zh-tw" /></main>;
}
