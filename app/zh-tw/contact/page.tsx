import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = { title: { absolute: "聯絡｜Modern Fundamental Analyst" }, description: "就投資研究與專業合作聯絡 Modern Fundamental Analyst。" };

export default function ContactPageZhTw() {
  return <main className="contact-page"><SiteHeader locale="zh-tw" counterpartPath="/contact" />
    <section className="page-hero contact-hero shell"><p className="eyebrow"><span /> 聯絡</p><h1>透過研究、觀點與機會<br /><em>建立連結。</em></h1><p className="contact-note">歡迎聯絡我，交流投資研究、財務建模、商業機會，或能幫助個人投資者的想法。</p></section>
    <section className="contact-grid shell"><div><span>研究</span><p>分享回饋、挑戰我的假設，或討論詳細的投資論點、估值方法與投資組合決策。</p></div><div><span>商業</span><p>歡迎就實習、合作、家教、財務建模專案，或其他金融領域的專業機會與我聯絡。</p></div></section><SiteFooter locale="zh-tw" /></main>;
}
