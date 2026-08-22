import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = { title: { absolute: "聯絡｜Modern Fundamental Analyst" }, description: "就投資研究與專業合作聯絡 Modern Fundamental Analyst。" };

export default function ContactPageZhTw() {
  return <main className="contact-page"><SiteHeader locale="zh-tw" counterpartPath="/contact" />
    <section className="page-hero contact-hero shell"><p className="eyebrow"><span /> 聯絡</p><h1>開始一場有深度的<br /><em>對話。</em></h1><p className="contact-note">聯絡資料與 Resend 表單將於正式發布前完成連接。</p></section>
    <section className="contact-grid shell"><div><span>研究交流</span><p>歡迎提出問題、理性反駁，以及值得長期思考的投資觀點。</p></div><div><span>專業合作</span><p>適用於合作邀請與其他專業洽詢。</p></div></section><SiteFooter locale="zh-tw" /></main>;
}
