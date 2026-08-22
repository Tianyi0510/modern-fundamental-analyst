import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({ title: "联系", description: "就投资研究与专业合作联系 Modern Fundamental Analyst。", path: "/contact", locale: "zh-cn" });

export default function ContactPageZhCn() {
  return <main className="contact-page"><SiteHeader locale="zh-cn" />
    <section className="page-hero contact-hero shell"><p className="eyebrow"><span /> 联系</p><h1>通过研究、观点与机会<br /><em>建立联系。</em></h1><p className="contact-note">欢迎联系我，交流投资研究、财务建模、商业机会，或能够帮助个人投资者的想法。</p></section>
    <section className="contact-grid shell"><div><span>研究</span><p>分享反馈、挑战我的假设，或讨论详细的投资论点、估值方法与投资组合决策。</p></div><div><span>商业</span><p>欢迎就实习、合作、家教、财务建模项目，或其他金融领域的专业机会与我联系。</p></div></section><SiteFooter locale="zh-cn" /></main>;
}
