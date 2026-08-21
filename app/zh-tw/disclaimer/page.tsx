import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = { title: { absolute: "免責聲明｜Modern Fundamental Analyst" }, description: "關於本網站研究與績效資料的重要說明。" };

export default function DisclaimerPageZhTw() {
  return <main><SiteHeader locale="zh-tw" counterpartPath="/disclaimer" /><section className="legal shell"><p className="eyebrow"><span /> 免責聲明</p><h1>重要資訊。</h1><div><h2>不構成投資建議</h2><p>本網站任何內容均不構成投資、法律、稅務或財務建議；所有資料僅供資訊與教育用途。</p><h2>績效</h2><p>過往績效不代表未來結果。此原型中的初始數據均為示意，不應被視為實際績效紀錄。</p><h2>持股與利益衝突</h2><p>已發布的觀點可能隨時變更，恕不另行通知。正式研究將揭露相關持股與潛在利益衝突。</p></div></section><SiteFooter locale="zh-tw" /></main>;
}
