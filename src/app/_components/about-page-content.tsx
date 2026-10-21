import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { brandSurface } from "@/components/brand-surface";
import { PageHero } from "@/components/page-hero";
import { appearance } from "./about-page-content.styles";
import Link from "next/link";
import { PageFooter } from "@/app/_components/page-footer";
import { SiteHeader } from "@/components/site-header";
import { getLocalizedPath, type Locale } from "@/lib/i18n";
import { getNavigationCopy } from "@/lib/navigation-copy";

type Section = { label: string; title: string; paragraphs: string[] };
type Copy = {
  eyebrow: string;
  headline: [string, string | string[]];
  introduction: string;
  disciplines: string;
  sections: Section[];
  boundaries: Array<{ title: string; items: string[] }>;
  closingLabel: string;
  closingTitle: string;
  closingParagraphs: string[];
  legalPrefix: string;
  disclaimer: string;
  conjunction: string;
  performance: string;
  legalSuffix: string;
};

const copy: Record<Locale, Copy> = {
  en: {
    eyebrow: "About",
    headline: ["Learn continuously", "and invest with accountability"],
    introduction:
      "Meet Tianyi (David) Li, a Rutgers University–New Brunswick Honors College student developing a transparent, long-term investment process.",
    disciplines: "Finance · BAIT · philosophy · music",
    sections: [
      {
        label: "01 · Introduction",
        title: "Why this research is published",
        paragraphs: [
          "Explore how stocks are researched, businesses are valued and portfolio decisions are evaluated.",
          "Modern Fundamental Analyst gives you access to published research, monthly holdings and performance. You can examine this public record over time.",
          "The goal is to help you understand businesses, question assumptions and make independent investment decisions.",
        ],
      },
      {
        label: "02 · What is a modern fundamental analyst?",
        title: "Traditional fundamentals for the coming technological waves",
        paragraphs: [
          "Start with the business: its operations, competitive position, financial statements, capital allocation, opportunities and risks.",
          "Accounting connects business activity to valuation. Integrated three-statement models link the income statement, balance sheet and cash flow statement. Discounted cash flow (DCF) models estimate the intrinsic value of stocks.",
          "Consider how AI and other disruptive technologies affect each business. Traditional fundamental analysis remains essential in a changing technological environment.",
        ],
      },
      {
        label: "03 · Investment philosophy",
        title: "Focus the portfolio and value businesses long-term",
        paragraphs: [
          "The portfolio uses focus investing: a limited number of well-understood positions lets the strongest ideas contribute meaningfully to results.",
          "The research uses long-term value investing. It compares business forecasts and estimated intrinsic value with market prices. A position can remain in the portfolio while the business develops as expected and the thesis remains valid.",
          "AI and other disruptive technologies can create opportunities. A strong trend alone does not make a stock a good investment; business quality, valuation and risk still matter.",
        ],
      },
      {
        label: "04 · Transparency and accountability",
        title: "Making every investment decision open to review",
        paragraphs: [
          "Review the full portfolio and performance record, disclosed monthly, alongside published investment theses.",
          "Published research currently covers selected companies. A detailed thesis or public financial model is not yet available for every holding.",
          "The record includes mistakes, thesis changes and periods of underperformance. Use it to evaluate the reasoning and results, rather than expect a flawless history.",
        ],
      },
      {
        label: "05 · Research and publishing",
        title: "Turning investment ideas into testable theses",
        paragraphs: [
          "Each investment memo turns an idea into a structured argument. It aims to explain the business, opportunity, evidence, valuation, risks and conditions that would change the thesis.",
          "Where appropriate, integrated three-statement models and DCF valuations connect operating assumptions with financial results and intrinsic value.",
          "Published theses record the reasoning before the outcome is known. You can examine the assumptions, challenge the conclusions and evaluate new evidence independently.",
        ],
      },
      {
        label: "06 · Background",
        title: "Growing through curiosity, empathy, and continuous learning",
        paragraphs: [
          "Tianyi (David) Li studies at Rutgers University–New Brunswick Honors College. His planned double major is finance and Business Analytics and Information Technology, with a possible minor in philosophy or music.",
          "The research approach reflects a “learn-it-all” mindset: ask better questions, listen with empathy, accept feedback and keep building knowledge and skills.",
          "When evidence challenges a view, revisit the thesis. Consistency should not come at the expense of learning.",
        ],
      },
    ],
    boundaries: [
      {
        title: "What this website is",
        items: [
          "A fully disclosed monthly portfolio and performance record",
          "An archive of published investment research",
          "A resource created to empower every retail investor",
        ],
      },
      {
        title: "What this website is not",
        items: [
          "A promise that every investment thesis will be correct",
          "A recommendation to buy or sell any particular security",
          "A substitute for independent research or professional financial advice",
        ],
      },
    ],
    closingLabel: "Closing",
    closingTitle: "Learn openly, think independently, improve continuously",
    closingParagraphs: [
      "Use this record to explore the reasoning behind investment decisions and compare it with the results.",
      "Question the assumptions, consider other perspectives and revise conclusions when the evidence changes.",
      "Monthly disclosures, published theses and transparent valuation methods help you develop an independent investment process.",
    ],
    legalPrefix: "For detailed legal and methodological information, see the ",
    disclaimer: "Disclaimer",
    conjunction: " and ",
    performance: "Performance",
    legalSuffix: " pages.",
  },
  "zh-tw": {
    eyebrow: "關於",
    headline: ["持續學習", ["以問責精神", "投資"]],
    introduction: "認識 Tianyi（David）Li：現就讀於羅格斯大學新布朗斯維克分校榮譽學院，正在建立透明、長期的投資流程。",
    disciplines: "金融 · 商業分析與資訊科技 · 哲學 · 音樂",
    sections: [
      {
        label: "01 · 介紹",
        title: "為何公開這些投資研究",
        paragraphs: [
          "探索股票研究、企業估值與投資組合決策的評估方式。",
          "你可以在 Modern Fundamental Analyst 查閱已發布的研究、每月持股與績效，並隨時間檢驗這份公開紀錄。",
          "目標是幫助你理解企業、質疑假設，並作出獨立的投資決策。",
        ],
      },
      {
        label: "02 · 什麼是現代基本面分析師？",
        title: "以傳統基本面迎接下一波科技浪潮",
        paragraphs: [
          "從企業本身出發：營運、競爭地位、財務報表、資本配置、機會與風險。",
          "會計將企業活動與估值連結起來。整合式三大財務報表模型串接損益表、資產負債表與現金流量表；現金流折現（DCF）模型則用於估計股票的內在價值。",
          "考慮人工智慧與其他顛覆性科技如何影響每家企業。面對科技環境的變化，傳統基本面分析仍不可或缺。",
        ],
      },
      {
        label: "03 · 投資哲學",
        title: "集中投資組合，長期評估企業價值",
        paragraphs: [
          "投資組合採用集中投資：持有少數經充分理解的部位，讓最強的投資觀點能對成果產生實質貢獻。",
          "研究採用長期價值投資，比較企業預測、估計內在價值與市場價格。只要企業按預期發展，且投資論點仍然成立，就可以繼續持有。",
          "人工智慧與其他顛覆性科技可能帶來機會。但強大的趨勢不會自動讓相關股票成為良好投資；企業品質、估值與風險仍然重要。",
        ],
      },
      {
        label: "04 · 透明度與問責",
        title: "讓每項投資決策接受公開檢視",
        paragraphs: [
          "查閱每月完整揭露的投資組合與績效紀錄，以及已發布的投資論點。",
          "目前已發布的研究涵蓋部分企業，並非每檔持股都已有詳細投資論點或公開財務模型。",
          "紀錄包括錯誤、論點變化與績效落後的時期。你可以藉此檢視推理與結果，而非期待一份毫無瑕疵的歷史。",
        ],
      },
      {
        label: "05 · 研究與發布",
        title: "把投資觀點轉化為可驗證的論點",
        paragraphs: [
          "每篇投資備忘錄將觀點轉化為有結構的論證，力求說明企業、機會、證據、估值、風險，以及會改變論點的條件。",
          "在適當情況下，整合式三大財務報表模型與 DCF 估值會將營運假設、財務成果與內在價值連結起來。",
          "已發布的論點保存結果出現前的推理。你可以檢視假設、質疑結論，並獨立評估新證據。",
        ],
      },
      {
        label: "06 · 背景",
        title: "以好奇心、同理心與持續學習成長",
        paragraphs: [
          "Tianyi（David）Li 現就讀於羅格斯大學新布朗斯維克分校榮譽學院，計劃雙主修金融與商業分析及資訊科技，並考慮輔修哲學或音樂。",
          "研究方式體現「learn-it-all」成長思維：提出更好的問題、以同理心傾聽、接受回饋，並持續累積知識與能力。",
          "當證據挑戰既有觀點時，重新檢視投資論點。不要為了維持一致而放棄學習。",
        ],
      },
    ],
    boundaries: [
      {
        title: "這個網站是",
        items: ["每月完整揭露的投資組合與績效紀錄", "已發布投資研究的資料庫", "為幫助每一位個人投資者而建立的資源"],
      },
      {
        title: "這個網站不是",
        items: ["對每項投資論點都會正確的承諾", "買入或賣出任何特定證券的建議", "獨立研究或專業財務建議的替代品"],
      },
    ],
    closingLabel: "結語",
    closingTitle: "公開學習，獨立思考，持續進步",
    closingParagraphs: [
      "透過這份紀錄，探索投資決策背後的推理，並與結果比較。",
      "質疑假設、考慮不同觀點，並在證據改變時修正結論。",
      "每月揭露、已發布的論點與透明的估值方法，幫助你建立獨立的投資流程。",
    ],
    legalPrefix: "更詳細的法律與方法資訊，請參閱",
    disclaimer: "免責聲明",
    conjunction: "與",
    performance: "績效",
    legalSuffix: "頁面。",
  },
  "zh-cn": {
    eyebrow: "关于",
    headline: ["持续学习", ["以问责精神", "投资"]],
    introduction: "认识 Tianyi（David）Li：现就读于罗格斯大学新布朗斯维克分校荣誉学院，正在建立透明、长期的投资流程。",
    disciplines: "金融 · 商业分析与信息技术 · 哲学 · 音乐",
    sections: [
      {
        label: "01 · 介绍",
        title: "为何公开这些投资研究",
        paragraphs: [
          "探索股票研究、企业估值与投资组合决策的评估方式。",
          "你可以在 Modern Fundamental Analyst 查阅已发布的研究、每月持仓与业绩，并随时间检验这份公开记录。",
          "目标是帮助你理解企业、质疑假设，并作出独立的投资决策。",
        ],
      },
      {
        label: "02 · 什么是现代基本面分析师？",
        title: "以传统基本面迎接下一波科技浪潮",
        paragraphs: [
          "从企业本身出发：运营、竞争地位、财务报表、资本配置、机会与风险。",
          "会计将企业活动与估值联系起来。整合式三大财务报表模型连接利润表、资产负债表与现金流量表；现金流折现（DCF）模型则用于估计股票的内在价值。",
          "考虑人工智能与其他颠覆性科技如何影响每家企业。面对科技环境的变化，传统基本面分析仍不可或缺。",
        ],
      },
      {
        label: "03 · 投资哲学",
        title: "集中投资组合，长期评估企业价值",
        paragraphs: [
          "投资组合采用集中投资：持有少数经过充分理解的仓位，让最强的投资观点能对结果产生实质贡献。",
          "研究采用长期价值投资，比较企业预测、估计内在价值与市场价格。只要企业按预期发展，且投资论点仍然成立，就可以继续持有。",
          "人工智能与其他颠覆性科技可能带来机会。但强大的趋势不会自动让相关股票成为良好投资；企业质量、估值与风险仍然重要。",
        ],
      },
      {
        label: "04 · 透明度与问责",
        title: "让每项投资决策接受公开检视",
        paragraphs: [
          "查阅每月完整披露的投资组合与业绩记录，以及已发布的投资论点。",
          "目前已发布的研究涵盖部分企业，并非每个持仓都已有详细投资论点或公开财务模型。",
          "记录包括错误、论点变化与业绩落后的时期。你可以据此检视推理与结果，而非期待一份毫无瑕疵的历史。",
        ],
      },
      {
        label: "05 · 研究与发布",
        title: "把投资观点转化为可验证的论点",
        paragraphs: [
          "每篇投资备忘录将观点转化为有结构的论证，力求说明企业、机会、证据、估值、风险，以及会改变论点的条件。",
          "在适当情况下，整合式三大财务报表模型与 DCF 估值会将运营假设、财务结果与内在价值联系起来。",
          "已发布的论点保留结果出现前的推理。你可以检视假设、质疑结论，并独立评估新证据。",
        ],
      },
      {
        label: "06 · 背景",
        title: "以好奇心、同理心与持续学习成长",
        paragraphs: [
          "Tianyi（David）Li 现就读于罗格斯大学新布朗斯维克分校荣誉学院，计划双主修金融与商业分析及信息技术，并考虑辅修哲学或音乐。",
          "研究方式体现“learn-it-all”成长思维：提出更好的问题、以同理心倾听、接受反馈，并持续积累知识与能力。",
          "当证据挑战既有观点时，重新检视投资论点。不要为了维持一致而放弃学习。",
        ],
      },
    ],
    boundaries: [
      {
        title: "这个网站是",
        items: ["每月完整披露的投资组合与业绩记录", "已发布投资研究的资料库", "为帮助每一位个人投资者而建立的资源"],
      },
      {
        title: "这个网站不是",
        items: ["对每项投资论点都会正确的承诺", "买入或卖出任何特定证券的建议", "独立研究或专业财务建议的替代品"],
      },
    ],
    closingLabel: "结语",
    closingTitle: "公开学习，独立思考，持续进步",
    closingParagraphs: [
      "通过这份记录，探索投资决策背后的推理，并与结果比较。",
      "质疑假设、考虑不同观点，并在证据改变时修正结论。",
      "每月披露、已发布的论点与透明的估值方法，帮助你建立独立的投资流程。",
    ],
    legalPrefix: "更详细的法律与方法信息，请参阅",
    disclaimer: "免责声明",
    conjunction: "与",
    performance: "业绩",
    legalSuffix: "页面。",
  },
};

export function AboutPageContent({ locale }: { locale: Locale }) {
  const text = copy[locale];
  return (
    <div className="about-page">
      <SiteHeader copy={getNavigationCopy(locale)} locale={locale} />
      <main id="main-content" tabIndex={-1} className="@container/about-page">
        <PageHero
          variant="standard"
          label={<>{text.eyebrow}</>}
          title={
            <>
              {text.headline[0]}
              {locale === "en" ? " " : null}
              <br className="compact:hidden" />
              <em>
                {Array.isArray(text.headline[1])
                  ? text.headline[1].map((phrase) => (
                      <span key={phrase} className="compact:inline-block">
                        {phrase}
                      </span>
                    ))
                  : text.headline[1]}
              </em>
            </>
          }
          intro={
            <>
              <p>{text.introduction}</p>
              <small>{text.disciplines}</small>
            </>
          }
        />
        {text.sections.map((section, index) => {
          const [number, sectionName] = section.label.split(" · ");
          return (
            <div
              className={"about-section-band " + (index % 2 === 1 ? appearance["section-gray"] : "")}
              key={section.label}
            >
              <section
                data-after-hero={index === 0 ? "" : undefined}
                className={appearance["about-section"] + " " + appearance["shell"]}
              >
                <div className={appearance["about-section-heading"]}>
                  <p className={appearance["section-number"] + " " + appearance["about-section-label"]}>
                    <span>{number}</span>
                    <span aria-hidden="true">·</span>
                    <span>{sectionName}</span>
                  </p>
                  <h2>{section.title}</h2>
                </div>
                <div className={appearance["about-copy"]}>
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            </div>
          );
        })}
        <section className={appearance["about-boundaries"]}>
          {text.boundaries.map((boundary, index) => (
            <section key={boundary.title} className={index === 1 ? brandSurface : undefined}>
              <Card variant="plain">
                <CardHeader className="px-0">
                  <h2>{boundary.title}</h2>
                </CardHeader>
                <CardContent className="px-0">
                  {/* Safari retains list semantics when visual markers are removed. */}
                  {/* eslint-disable-next-line jsx-a11y/no-redundant-roles */}
                  <ol role="list">
                    {boundary.items.map((item) => (
                      <li key={item}>
                        <span className={appearance["about-boundary-number"]} aria-hidden="true">
                          {index === 0 ? <Check size={24} strokeWidth={2} /> : <X size={24} strokeWidth={2} />}
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </section>
          ))}
        </section>
        <section className={appearance["about-closing"] + " " + appearance["shell"]}>
          <p className={appearance["eyebrow"]}>
            <span /> {text.closingLabel}
          </p>
          <h2>{text.closingTitle}</h2>
          <div>
            {text.closingParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <p className={appearance["reference-note"]}>
              {text.legalPrefix}
              <Link className={appearance["source-link"]} href={getLocalizedPath("/disclaimer", locale)}>
                {text.disclaimer}
              </Link>
              {text.conjunction}
              <Link className={appearance["source-link"]} href={getLocalizedPath("/performance", locale)}>
                {text.performance}
              </Link>
              {text.legalSuffix}
            </p>
          </div>
        </section>
      </main>
      <PageFooter locale={locale} />
    </div>
  );
}
