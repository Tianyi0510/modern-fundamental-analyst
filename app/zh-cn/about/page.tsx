import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({ title: "关于", description: "Tianyi（David）Li 的背景、投资方法，以及 Modern Fundamental Analyst 背后的理念。", path: "/about", locale: "zh-cn" });

export default function AboutPageZhCn() {
  return <main className="about-page" id="main-content"><SiteHeader locale="zh-cn" />
    <section className="page-hero shell">
      <p className="eyebrow"><span /> 关于</p>
      <h1>持续学习。<br /><em>以问责精神投资。</em></h1>
      <div className="page-intro"><p>我是 Tianyi（David）Li，即将进入罗格斯大学荣誉学院，并正在建立一套透明、长期的投资流程。</p><small>金融 · 商业分析与信息技术 · 哲学 · 音乐</small></div>
    </section>

    <section className="about-section shell"><div className="about-section-heading"><span>01 · 介绍</span><h2>我为何建立 Modern Fundamental Analyst</h2></div><div className="about-copy"><p>Modern Fundamental Analyst 记录我如何研究股票、评估企业价值、管理投资组合，以及检视自己的成果。</p><p>我相信个人投资者应该能够获得透明的投资研究与容易理解的估值方法。通过公开投资组合、业绩、财务模型与投资论点，我希望建立一份可以随时间检验的公开记录。</p><p>这个网站的使命，是帮助每一位个人投资者理解企业、质疑假设，并作出独立的投资决策。</p></div></section>

    <section className="about-section shell"><div className="about-section-heading"><span>02 · 什么是现代基本面分析师？</span><h2>以传统基本面迎接下一波科技浪潮</h2></div><div className="about-copy"><p>现代基本面分析师从企业本身出发：其运营、竞争地位、财务报表、资本配置、长期机会与风险。</p><p>我重视会计作为商业语言及财务建模基础的作用。我建立整合式三大财务报表模型，以理解利润表、资产负债表与现金流量表如何相互联动，再运用 DCF 模型评估股票的内在价值。</p><p>我也相信人工智能与其他颠覆性科技浪潮即将到来。传统基本面分析仍不可或缺，但必须应用于在快速变化的科技环境中运营的企业。</p></div></section>

    <section className="about-section shell"><div className="about-section-heading"><span>03 · 投资哲学</span><h2>集中投资组合，长期评估企业价值</h2></div><div className="about-copy"><p>在投资组合管理上，我相信集中投资。我偏好持有少数自己真正理解并抱有信念的仓位，让最强的投资观点能够对业绩产生实质贡献。</p><p>在股票分析上，我相信长期价值投资。我研究企业、建立财务预测、评估其内在价值，并将该价值与市场价格比较。只要企业持续按照预期发展，而且原始投资论点仍然成立，我愿意长期持有股票。</p><p>我也寻找有望受益于人工智能与其他颠覆性科技的企业。然而，强大的趋势并不会自动使每一只相关股票成为良好投资；企业质量、估值与风险仍然重要。</p></div></section>

    <section className="about-section shell"><div className="about-section-heading"><span>04 · 透明度与问责</span><h2>让每项投资决策接受公开检视</h2></div><div className="about-copy"><p>我通过每月完整披露投资组合与业绩，并发布详细投资论点，推动透明度与问责。</p><p>每月披露建立了一份我持有什么、以及决策表现如何的公开记录。我的投资论点会说明为何持有每一只股票、我认为它价值多少、市场可能忽略了什么，以及什么因素会使我的观点改变。</p><p>目标不是呈现一份毫无瑕疵的记录，而是让我的推理与结果清楚到足以被诚实评估，包括错误、论点变化与业绩落后的时期。</p></div></section>

    <section className="about-section shell"><div className="about-section-heading"><span>05 · 研究与写作</span><h2>把投资观点转化为可验证的论点</h2></div><div className="about-copy"><p>我运用投资备忘录，将观点转化为有结构且可验证的论证。每项投资论点都力求说明企业、投资机会、支持证据、估值、主要风险，以及会使我改变观点的条件。</p><p>在适当情况下，我会以整合式三大财务报表模型与 DCF 估值支持研究。模型将运营假设与财务表现及内在价值连接起来。</p><p>在结果出现前发布投资论点，能够留下当时的公开记录。读者可以检视我的假设、不同意我的结论，并随新证据出现而独立评估每一项观点。</p></div></section>

    <section className="about-section shell"><div className="about-section-heading"><span>06 · 背景</span><h2>以好奇心、同理心与持续学习成长</h2></div><div className="about-copy"><p>我即将进入罗格斯大学新布朗斯维克分校荣誉学院，计划双主修金融与商业分析及信息技术，并考虑辅修哲学或音乐。</p><p>我倡导以好奇心、同理心与持续学习为基础的“learn-it-all”成长思维。我不期待自己一开始就拥有所有答案，而是希望提出更好的问题、倾听不同观点、接受反馈，并持续提升知识与能力。</p><p>这种思维也塑造了我的投资方式。当证据挑战既有观点时，我宁愿重新检视并修正投资论点，也不会只为了维持一致而捍卫先前的结论。</p></div></section>

    <section className="about-boundaries shell"><article><h2>这个网站是</h2><ol><li>每月完整披露的投资组合与业绩记录</li><li>详细投资论点与财务模型的资料库</li><li>为帮助每一位个人投资者而建立的资源</li></ol></article><article><h2>这个网站不是</h2><ol><li>对每项投资论点都会正确的承诺</li><li>买入或卖出任何特定证券的建议</li><li>独立研究或专业财务建议的替代品</li></ol></article></section>

    <section className="about-closing shell"><p className="eyebrow"><span /> 结语</p><h2>公开学习，独立思考，持续进步</h2><div><p>我相信公开学习、透明投资，并帮助他人独立思考。</p><p>我不期待自己拥有所有答案。我希望保持好奇、以同理心面对不同观点、清楚说明自己的假设，并在证据改变时修正结论。</p><p>Modern Fundamental Analyst 保存我每项投资决策背后的推理，并以结果衡量这些决策。通过每月披露投资组合与业绩、发布详细投资论点与透明的估值方法，我希望建立更严谨的投资流程，同时帮助每一位个人投资者发展自己的判断。</p><p>更详细的法律与方法信息，请参阅<Link href="/zh-cn/disclaimer">免责声明</Link>与<Link href="/zh-cn/performance">业绩</Link>页面。</p></div></section>
    <SiteFooter locale="zh-cn" />
  </main>;
}
