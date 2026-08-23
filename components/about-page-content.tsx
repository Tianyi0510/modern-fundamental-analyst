import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import type { Locale } from "@/lib/i18n";

type Section = { label: string; title: string; paragraphs: string[] };
type Copy = {
  eyebrow: string; headline: [string, string]; introduction: string; disciplines: string;
  sections: Section[]; boundaries: Array<{ title: string; items: string[] }>;
  closingLabel: string; closingTitle: string; closingParagraphs: string[];
  legalPrefix: string; disclaimer: string; conjunction: string; performance: string; legalSuffix: string;
};

const copy: Record<Locale, Copy> = {
  en: {
    eyebrow: "About", headline: ["Learning Continuously.", "Investing with Accountability."],
    introduction: "I am Tianyi (David) Li, an incoming Rutgers Honors College student building a transparent, long-term investment process.", disciplines: "Finance · BAIT · Philosophy · Music",
    sections: [
      { label: "01 · Introduction", title: "Why I Built Modern Fundamental Analyst", paragraphs: ["Modern Fundamental Analyst documents how I research stocks, value businesses, manage my portfolio, and evaluate my results.", "I believe retail investors should have access to transparent investment research and understandable valuation methods. By publishing my portfolio, performance, financial models, and investment theses, I aim to create a public record that can be examined over time.", "The mission of this website is to empower every retail investor to understand businesses, question assumptions, and make independent investment decisions."] },
      { label: "02 · What is a Modern Fundamental Analyst?", title: "Traditional Fundamentals for the Coming Technological Waves", paragraphs: ["A modern fundamental analyst begins with the business: its operations, competitive position, financial statements, capital allocation, long-term opportunities, and risks.", "I value accounting as the language of business and as the foundation of financial modeling. I build integrated 3-statement models to understand how the income statement, balance sheet, and cash flow statement work together. I then use DCF models to determine the intrinsic value of stocks.", "I also believe in the coming waves of AI and other disruptive technologies. Traditional fundamental analysis remains essential, but it must be applied to businesses operating in a rapidly changing technological environment."] },
      { label: "03 · Investment Philosophy", title: "Focus the Portfolio and Value Businesses Long-Term", paragraphs: ["I believe in focus investing for portfolio management. I prefer a limited number of positions that I understand and genuinely believe in, allowing my strongest ideas to contribute meaningfully to performance.", "For stock pitching, I believe in long-term value investing. I study the business, build financial forecasts, determine its intrinsic value, and compare that value with its market price. I am willing to hold a stock for the long term when the business continues to develop as expected and the original thesis remains valid.", "I also look for businesses positioned to benefit from AI and other disruptive technologies. However, a powerful trend does not automatically make every related stock a good investment. Business quality, valuation, and risk still matter."] },
      { label: "04 · Transparency and Accountability", title: "Making Every Investment Decision Open to Review", paragraphs: ["I promote transparency and accountability by fully disclosing my portfolio and performance every month and publishing detailed investment theses.", "Monthly disclosure creates a public record of what I own and how my decisions perform. My investment theses explain why I own each stock, what I believe it is worth, what the market may be missing, and what could cause my view to change.", "The objective is not to present a flawless record. It is to make my reasoning and results clear enough to be evaluated honestly, including mistakes, thesis changes, and periods of underperformance."] },
      { label: "05 · Research and Writing", title: "Turning Investment Ideas into Testable Theses", paragraphs: ["I use investment memos to turn opinions into structured and testable arguments. Each thesis aims to explain the business, investment opportunity, supporting evidence, valuation, major risks, and conditions that would cause my view to change.", "Where appropriate, I support my research with an integrated 3-statement model and DCF valuation. The model connects operating assumptions with financial performance and intrinsic value.", "Publishing the thesis creates a record before the outcome is known. Readers can examine my assumptions, disagree with my conclusions, and evaluate each idea independently as new evidence becomes available."] },
      { label: "06 · Background", title: "Growing Through Curiosity, Empathy, and Continuous Learning", paragraphs: ["I am an incoming Rutgers University–New Brunswick Honors College student intending to double major in Finance and Business Analytics and Information Technology. I also intend to pursue a minor in either Philosophy or Music.", "I promote a “learn-it-all” growth mindset based on curiosity, empathy, and continuous learning. I do not expect to begin with every answer. Instead, I aim to ask better questions, listen to different perspectives, accept feedback, and continuously improve my knowledge and skills.", "This mindset also shapes how I invest. When evidence challenges an existing view, I would rather examine it and revise my thesis than defend an earlier conclusion simply for consistency."] },
    ],
    boundaries: [{ title: "What This Website Is", items: ["A fully disclosed monthly record of my portfolio and performance", "A repository for detailed investment theses and financial models", "A resource created to empower every retail investor"] }, { title: "What This Website Is Not", items: ["A promise that every investment thesis will be correct", "A recommendation to buy or sell any particular security", "A substitute for independent research or professional financial advice"] }],
    closingLabel: "Closing", closingTitle: "Learn Openly, Think Independently, Improve Continuously",
    closingParagraphs: ["I believe in learning openly, investing transparently, and empowering others to think independently.", "I do not expect to have every answer. I aim to remain curious, approach different perspectives with empathy, make my assumptions clear, and revise my conclusions when the evidence changes.", "Modern Fundamental Analyst preserves the reasoning behind my investment decisions and measures those decisions against their results. Through monthly portfolio and performance disclosure, detailed investment theses, and transparent valuation methods, I hope to build a more rigorous investment process while empowering every retail investor to develop their own."],
    legalPrefix: "For detailed legal and methodological information, see the ", disclaimer: "Disclaimer", conjunction: " and ", performance: "Performance", legalSuffix: " pages.",
  },
  "zh-tw": {
    eyebrow: "關於", headline: ["持續學習。", "以問責精神投資。"], introduction: "我是 Tianyi（David）Li，即將進入羅格斯大學榮譽學院，並正在建立一套透明、長期的投資流程。", disciplines: "金融 · 商業分析與資訊科技 · 哲學 · 音樂",
    sections: [
      { label: "01 · 介紹", title: "我為何建立 Modern Fundamental Analyst", paragraphs: ["Modern Fundamental Analyst 記錄我如何研究股票、評估企業價值、管理投資組合，以及檢視自己的成果。", "我相信個人投資者應能取得透明的投資研究與容易理解的估值方法。透過公開投資組合、績效、財務模型與投資論點，我希望建立一份可隨時間檢驗的公開紀錄。", "這個網站的使命，是幫助每一位個人投資者理解企業、質疑假設，並作出獨立的投資決策。"] },
      { label: "02 · 什麼是現代基本面分析師？", title: "以傳統基本面迎接下一波科技浪潮", paragraphs: ["現代基本面分析師從企業本身出發：其營運、競爭地位、財務報表、資本配置、長期機會與風險。", "我重視會計作為商業語言及財務建模基礎的角色。我建立整合式三大財務報表模型，以理解損益表、資產負債表與現金流量表如何相互連動，再運用 DCF 模型評估股票的內在價值。", "我也相信人工智慧與其他顛覆性科技浪潮即將到來。傳統基本面分析仍不可或缺，但必須應用於在快速變化科技環境中營運的企業。"] },
      { label: "03 · 投資哲學", title: "集中投資組合，長期評估企業價值", paragraphs: ["在投資組合管理上，我相信集中投資。我偏好持有少數自己真正理解並抱有信念的部位，讓最強的投資觀點能對績效產生實質貢獻。", "在股票分析上，我相信長期價值投資。我研究企業、建立財務預測、評估其內在價值，並將該價值與市場價格比較。只要企業持續按照預期發展，而且原始投資論點仍然成立，我願意長期持有股票。", "我也尋找有望受益於人工智慧與其他顛覆性科技的企業。然而，強大的趨勢並不會自動使每一檔相關股票成為良好投資；企業品質、估值與風險仍然重要。"] },
      { label: "04 · 透明度與問責", title: "讓每項投資決策接受公開檢視", paragraphs: ["我透過每月完整揭露投資組合與績效，並發布詳細投資論點，推動透明度與問責。", "每月揭露建立了一份我持有什麼、以及決策表現如何的公開紀錄。我的投資論點會說明為何持有每一檔股票、我認為它價值多少、市場可能忽略了什麼，以及什麼因素會使我的觀點改變。", "目標不是呈現一份毫無瑕疵的紀錄，而是讓我的推理與結果清楚到足以被誠實評估，包括錯誤、論點變化與績效落後的時期。"] },
      { label: "05 · 研究與寫作", title: "把投資觀點轉化為可驗證的論點", paragraphs: ["我運用投資備忘錄，將觀點轉化為有結構且可驗證的論證。每項投資論點都力求說明企業、投資機會、支持證據、估值、主要風險，以及會使我改變觀點的條件。", "在適當情況下，我會以整合式三大財務報表模型與 DCF 估值支持研究。模型將營運假設與財務表現及內在價值連結起來。", "在結果出現前發布投資論點，能留下當時的公開紀錄。讀者可以檢視我的假設、不同意我的結論，並隨新證據出現而獨立評估每一項觀點。"] },
      { label: "06 · 背景", title: "以好奇心、同理心與持續學習成長", paragraphs: ["我即將進入羅格斯大學新布朗斯維克分校榮譽學院，計畫雙主修金融與商業分析及資訊科技，並考慮輔修哲學或音樂。", "我提倡以好奇心、同理心與持續學習為基礎的「learn-it-all」成長思維。我不期待自己一開始就擁有所有答案，而是希望提出更好的問題、聆聽不同觀點、接受回饋，並持續提升知識與能力。", "這種思維也塑造了我的投資方式。當證據挑戰既有觀點時，我寧願重新檢視並修正投資論點，也不會只為了維持一致而捍衛先前的結論。"] },
    ],
    boundaries: [{ title: "這個網站是", items: ["每月完整揭露的投資組合與績效紀錄", "詳細投資論點與財務模型的資料庫", "為幫助每一位個人投資者而建立的資源"] }, { title: "這個網站不是", items: ["對每項投資論點都會正確的承諾", "買入或賣出任何特定證券的建議", "獨立研究或專業財務建議的替代品"] }],
    closingLabel: "結語", closingTitle: "公開學習，獨立思考，持續進步", closingParagraphs: ["我相信公開學習、透明投資，並幫助他人獨立思考。", "我不期待自己擁有所有答案。我希望保持好奇、以同理心面對不同觀點、清楚說明自己的假設，並在證據改變時修正結論。", "Modern Fundamental Analyst 保存我每項投資決策背後的推理，並以結果衡量這些決策。透過每月揭露投資組合與績效、發布詳細投資論點與透明的估值方法，我希望建立更嚴謹的投資流程，同時幫助每一位個人投資者發展自己的判斷。"],
    legalPrefix: "更詳細的法律與方法資訊，請參閱", disclaimer: "免責聲明", conjunction: "與", performance: "績效", legalSuffix: "頁面。",
  },
  "zh-cn": {
    eyebrow: "关于", headline: ["持续学习。", "以问责精神投资。"], introduction: "我是 Tianyi（David）Li，即将进入罗格斯大学荣誉学院，并正在建立一套透明、长期的投资流程。", disciplines: "金融 · 商业分析与信息技术 · 哲学 · 音乐",
    sections: [
      { label: "01 · 介绍", title: "我为何建立 Modern Fundamental Analyst", paragraphs: ["Modern Fundamental Analyst 记录我如何研究股票、评估企业价值、管理投资组合，以及检视自己的成果。", "我相信个人投资者应该能够获得透明的投资研究与容易理解的估值方法。通过公开投资组合、业绩、财务模型与投资论点，我希望建立一份可以随时间检验的公开记录。", "这个网站的使命，是帮助每一位个人投资者理解企业、质疑假设，并作出独立的投资决策。"] },
      { label: "02 · 什么是现代基本面分析师？", title: "以传统基本面迎接下一波科技浪潮", paragraphs: ["现代基本面分析师从企业本身出发：其运营、竞争地位、财务报表、资本配置、长期机会与风险。", "我重视会计作为商业语言及财务建模基础的作用。我建立整合式三大财务报表模型，以理解利润表、资产负债表与现金流量表如何相互联动，再运用 DCF 模型评估股票的内在价值。", "我也相信人工智能与其他颠覆性科技浪潮即将到来。传统基本面分析仍不可或缺，但必须应用于在快速变化的科技环境中运营的企业。"] },
      { label: "03 · 投资哲学", title: "集中投资组合，长期评估企业价值", paragraphs: ["在投资组合管理上，我相信集中投资。我偏好持有少数自己真正理解并抱有信念的仓位，让最强的投资观点能够对业绩产生实质贡献。", "在股票分析上，我相信长期价值投资。我研究企业、建立财务预测、评估其内在价值，并将该价值与市场价格比较。只要企业持续按照预期发展，而且原始投资论点仍然成立，我愿意长期持有股票。", "我也寻找有望受益于人工智能与其他颠覆性科技的企业。然而，强大的趋势并不会自动使每一只相关股票成为良好投资；企业质量、估值与风险仍然重要。"] },
      { label: "04 · 透明度与问责", title: "让每项投资决策接受公开检视", paragraphs: ["我通过每月完整披露投资组合与业绩，并发布详细投资论点，推动透明度与问责。", "每月披露建立了一份我持有什么、以及决策表现如何的公开记录。我的投资论点会说明为何持有每一只股票、我认为它价值多少、市场可能忽略了什么，以及什么因素会使我的观点改变。", "目标不是呈现一份毫无瑕疵的记录，而是让我的推理与结果清楚到足以被诚实评估，包括错误、论点变化与业绩落后的时期。"] },
      { label: "05 · 研究与写作", title: "把投资观点转化为可验证的论点", paragraphs: ["我运用投资备忘录，将观点转化为有结构且可验证的论证。每项投资论点都力求说明企业、投资机会、支持证据、估值、主要风险，以及会使我改变观点的条件。", "在适当情况下，我会以整合式三大财务报表模型与 DCF 估值支持研究。模型将运营假设与财务表现及内在价值连接起来。", "在结果出现前发布投资论点，能够留下当时的公开记录。读者可以检视我的假设、不同意我的结论，并随新证据出现而独立评估每一项观点。"] },
      { label: "06 · 背景", title: "以好奇心、同理心与持续学习成长", paragraphs: ["我即将进入罗格斯大学新布朗斯维克分校荣誉学院，计划双主修金融与商业分析及信息技术，并考虑辅修哲学或音乐。", "我倡导以好奇心、同理心与持续学习为基础的“learn-it-all”成长思维。我不期待自己一开始就拥有所有答案，而是希望提出更好的问题、倾听不同观点、接受反馈，并持续提升知识与能力。", "这种思维也塑造了我的投资方式。当证据挑战既有观点时，我宁愿重新检视并修正投资论点，也不会只为了维持一致而捍卫先前的结论。"] },
    ],
    boundaries: [{ title: "这个网站是", items: ["每月完整披露的投资组合与业绩记录", "详细投资论点与财务模型的资料库", "为帮助每一位个人投资者而建立的资源"] }, { title: "这个网站不是", items: ["对每项投资论点都会正确的承诺", "买入或卖出任何特定证券的建议", "独立研究或专业财务建议的替代品"] }],
    closingLabel: "结语", closingTitle: "公开学习，独立思考，持续进步", closingParagraphs: ["我相信公开学习、透明投资，并帮助他人独立思考。", "我不期待自己拥有所有答案。我希望保持好奇、以同理心面对不同观点、清楚说明自己的假设，并在证据改变时修正结论。", "Modern Fundamental Analyst 保存我每项投资决策背后的推理，并以结果衡量这些决策。通过每月披露投资组合与业绩、发布详细投资论点与透明的估值方法，我希望建立更严谨的投资流程，同时帮助每一位个人投资者发展自己的判断。"],
    legalPrefix: "更详细的法律与方法信息，请参阅", disclaimer: "免责声明", conjunction: "与", performance: "业绩", legalSuffix: "页面。",
  },
};

export function AboutPageContent({ locale }: { locale: Locale }) {
  const text = copy[locale];
  const prefix = locale === "en" ? "" : `/${locale}`;
  return <main className="about-page" id="main-content"><SiteHeader locale={locale} />
    <section className="page-hero shell"><p className="eyebrow"><span /> {text.eyebrow}</p><h1>{text.headline[0]}<br /><em>{text.headline[1]}</em></h1><div className="page-intro"><p>{text.introduction}</p><small>{text.disciplines}</small></div></section>
    {text.sections.map((section, index) => <section className={`about-section shell${index % 2 === 1 ? " section-gray" : ""}`} key={section.label}><div className="about-section-heading"><span>{section.label}</span><h2>{section.title}</h2></div><div className="about-copy">{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></section>)}
    <section className="about-boundaries shell">{text.boundaries.map((boundary) => <article key={boundary.title}><h2>{boundary.title}</h2><ol>{boundary.items.map((item) => <li key={item}>{item}</li>)}</ol></article>)}</section>
    <section className="about-closing shell"><p className="eyebrow"><span /> {text.closingLabel}</p><h2>{text.closingTitle}</h2><div>{text.closingParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<p>{text.legalPrefix}<Link href={`${prefix}/disclaimer`}>{text.disclaimer}</Link>{text.conjunction}<Link href={`${prefix}/performance`}>{text.performance}</Link>{text.legalSuffix}</p></div></section>
    <SiteFooter locale={locale} />
  </main>;
}
