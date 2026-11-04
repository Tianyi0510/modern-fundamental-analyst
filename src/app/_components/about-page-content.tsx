import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { brandSurface } from "@/components/brand-surface";
import { PageHero } from "@/components/page-hero";
import { appearance } from "./about-page-content.styles";
import Link from "next/link";
import { PageFooter } from "@/app/_components/page-footer";
import { SiteHeader } from "@/components/site-header/site-header";
import { getLocalizedPath, type Locale } from "@/lib/i18n";
import { getNavigationCopy } from "@/lib/navigation-copy";

type Section = { label: string; title: string; paragraphs: string[] };
type Copy = {
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
    headline: ["Learn continuously", "and invest with accountability"],
    introduction:
      "I’m Tianyi (David) Li, a Rutgers University–New Brunswick Honors College student. I believe investing is for everyone.",
    disciplines: "Finance · BAIT · philosophy · music",
    sections: [
      {
        label: "01 · Introduction",
        title: "Why this research is published",
        paragraphs: [
          "I believe investing is for everyone. The mission of Modern Fundamental Analyst is to empower every retail investor.",
          "I publish my research, portfolio and performance so you can examine my thinking and results over time.",
          "I want to help you understand businesses, question assumptions and make independent investment decisions.",
        ],
      },
      {
        label: "02 · What is a modern fundamental analyst?",
        title: "Traditional fundamentals for the coming technological waves",
        paragraphs: [
          "I start with the business: its operations, competitive position, financial statements, capital allocation, opportunities and risks.",
          "I value accounting as the language of business and as the foundation of financial modeling.",
          "I believe in the coming waves of AI and other disruptive technologies. Traditional fundamental analysis helps me understand how they may change a business.",
        ],
      },
      {
        label: "03 · Investment philosophy",
        title: "Focus the portfolio and value businesses long-term",
        paragraphs: [
          "I believe in value investing for stock pitching. I believe in focus investing for portfolio management.",
          "I believe in the importance of staying in the circle of competence and knowing what you’re doing.",
          "I believe in the power of compounding. I believe in the importance of patience and discipline in investing.",
        ],
      },
      {
        label: "04 · Transparency and accountability",
        title: "Making every investment decision open to review",
        paragraphs: [
          "I promote transparency and accountability by fully disclosing my portfolio and performance monthly and publishing detailed investment theses.",
          "Published research currently covers selected companies. A detailed thesis or public financial model is not yet available for every holding.",
          "I share this record so you can evaluate my reasoning and results, including mistakes, thesis changes and periods of underperformance.",
        ],
      },
      {
        label: "05 · Research and publishing",
        title: "Turning investment ideas into testable theses",
        paragraphs: [
          "I build 3-statement and DCF models to determine the intrinsic value of stocks.",
          "My investment memos explain the business, evidence, valuation, risks and conditions that would change my thesis.",
          "Publishing my theses lets you examine my assumptions, challenge my conclusions and evaluate new evidence independently.",
        ],
      },
      {
        label: "06 · Background",
        title: "Growing through curiosity, empathy, and continuous learning",
        paragraphs: [
          "I’m Tianyi (David) Li, a Rutgers University–New Brunswick Honors College student. I plan to double major in finance and Business Analytics and Information Technology, with a possible minor in philosophy or music.",
          "I promote a “learn-it-all” growth mindset based on curiosity, empathy, and continuous learning.",
          "When evidence challenges my view, I revisit the thesis. I want to keep learning, not defend a conclusion at any cost.",
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
      "I believe in the benefits of free trade and the dynamism of capitalism.",
      "I believe in the individual rights to life, liberty, and the pursuit of happiness.",
      "I believe investing is for everyone. I hope this public record helps you learn, think independently and build your own investment process.",
    ],
    legalPrefix: "For detailed legal and methodological information, see the ",
    disclaimer: "Disclaimer",
    conjunction: " and ",
    performance: "Performance",
    legalSuffix: " pages.",
  },
  "zh-tw": {
    headline: ["持續學習", ["以問責精神", "投資"]],
    introduction: "我是 Tianyi（David）Li，現就讀於羅格斯大學新布朗斯維克分校榮譽學院。我相信投資屬於每一個人。",
    disciplines: "金融 · 商業分析與資訊科技 · 哲學 · 音樂",
    sections: [
      {
        label: "01 · 介紹",
        title: "為何公開這些投資研究",
        paragraphs: [
          "我相信投資屬於每一個人。Modern Fundamental Analyst 的使命，是賦能每一位個人投資者。",
          "我公開研究、投資組合與績效，讓你能隨時間檢視我的思考與成果。",
          "我希望幫助你理解企業、質疑假設，並作出獨立的投資決策。",
        ],
      },
      {
        label: "02 · 什麼是現代基本面分析師？",
        title: "以傳統基本面迎接下一波科技浪潮",
        paragraphs: [
          "我從企業本身出發：營運、競爭地位、財務報表、資本配置、機會與風險。",
          "我重視會計，視它為商業的語言，也是財務建模的基礎。",
          "我相信人工智慧與其他顛覆性科技的浪潮即將到來。傳統基本面分析幫助我理解它們可能如何改變企業。",
        ],
      },
      {
        label: "03 · 投資哲學",
        title: "集中投資組合，長期評估企業價值",
        paragraphs: [
          "我相信以價值投資提出股票投資論點，以集中投資管理投資組合。",
          "我相信堅守能力圈、清楚自己在做什麼的重要性。",
          "我相信複利的力量，也相信耐心與紀律在投資中的重要性。",
        ],
      },
      {
        label: "04 · 透明度與問責",
        title: "讓每項投資決策接受公開檢視",
        paragraphs: [
          "我透過每月完整揭露投資組合與績效，並發布詳細的投資論點，促進透明度與問責。",
          "目前已發布的研究涵蓋部分企業，並非每檔持股都已有詳細投資論點或公開財務模型。",
          "我分享這份紀錄，讓你能檢視我的推理與結果，包括錯誤、論點變化與績效落後的時期。",
        ],
      },
      {
        label: "05 · 研究與發布",
        title: "把投資觀點轉化為可驗證的論點",
        paragraphs: [
          "我建立三大財務報表模型與現金流折現（DCF）模型，以判斷股票的內在價值。",
          "我的投資備忘錄說明企業、證據、估值、風險，以及會改變投資論點的條件。",
          "公開投資論點，讓你可以檢視我的假設、質疑我的結論，並獨立評估新證據。",
        ],
      },
      {
        label: "06 · 背景",
        title: "以好奇心、同理心與持續學習成長",
        paragraphs: [
          "我是 Tianyi（David）Li，現就讀於羅格斯大學新布朗斯維克分校榮譽學院。我計劃雙主修金融與商業分析及資訊科技，並考慮輔修哲學或音樂。",
          "我提倡以好奇心、同理心與持續學習為基礎的「learn-it-all」成長思維。",
          "當證據挑戰我的觀點時，我會重新檢視投資論點。我希望持續學習，而非不惜代價捍衛結論。",
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
      "我相信自由貿易帶來的益處，以及資本主義的活力。",
      "我相信每個人都享有生命、自由與追求幸福的權利。",
      "我相信投資屬於每一個人。我希望這份公開紀錄能幫助你學習、獨立思考，並建立自己的投資流程。",
    ],
    legalPrefix: "更詳細的法律與方法資訊，請參閱",
    disclaimer: "免責聲明",
    conjunction: "與",
    performance: "績效",
    legalSuffix: "頁面。",
  },
  "zh-cn": {
    headline: ["持续学习", ["以问责精神", "投资"]],
    introduction: "我是 Tianyi（David）Li，现就读于罗格斯大学新布朗斯维克分校荣誉学院。我相信投资属于每一个人。",
    disciplines: "金融 · 商业分析与信息技术 · 哲学 · 音乐",
    sections: [
      {
        label: "01 · 介绍",
        title: "为何公开这些投资研究",
        paragraphs: [
          "我相信投资属于每一个人。Modern Fundamental Analyst 的使命，是赋能每一位个人投资者。",
          "我公开研究、投资组合与业绩，让你能随时间检视我的思考与成果。",
          "我希望帮助你理解企业、质疑假设，并作出独立的投资决策。",
        ],
      },
      {
        label: "02 · 什么是现代基本面分析师？",
        title: "以传统基本面迎接下一波科技浪潮",
        paragraphs: [
          "我从企业本身出发：运营、竞争地位、财务报表、资本配置、机会与风险。",
          "我重视会计，视它为商业的语言，也是财务建模的基础。",
          "我相信人工智能与其他颠覆性科技的浪潮即将到来。传统基本面分析帮助我理解它们可能如何改变企业。",
        ],
      },
      {
        label: "03 · 投资哲学",
        title: "集中投资组合，长期评估企业价值",
        paragraphs: [
          "我相信以价值投资提出股票投资论点，以集中投资管理投资组合。",
          "我相信坚守能力圈、清楚自己在做什么的重要性。",
          "我相信复利的力量，也相信耐心与纪律在投资中的重要性。",
        ],
      },
      {
        label: "04 · 透明度与问责",
        title: "让每项投资决策接受公开检视",
        paragraphs: [
          "我通过每月完整披露投资组合与业绩，并发布详细的投资论点，促进透明度与问责。",
          "目前已发布的研究涵盖部分企业，并非每个持仓都已有详细投资论点或公开财务模型。",
          "我分享这份记录，让你能检视我的推理与结果，包括错误、论点变化与业绩落后的时期。",
        ],
      },
      {
        label: "05 · 研究与发布",
        title: "把投资观点转化为可验证的论点",
        paragraphs: [
          "我建立三大财务报表模型与现金流折现（DCF）模型，以判断股票的内在价值。",
          "我的投资备忘录说明企业、证据、估值、风险，以及会改变投资论点的条件。",
          "公开投资论点，让你可以检视我的假设、质疑我的结论，并独立评估新证据。",
        ],
      },
      {
        label: "06 · 背景",
        title: "以好奇心、同理心与持续学习成长",
        paragraphs: [
          "我是 Tianyi（David）Li，现就读于罗格斯大学新布朗斯维克分校荣誉学院。我计划双主修金融与商业分析及信息技术，并考虑辅修哲学或音乐。",
          "我提倡以好奇心、同理心与持续学习为基础的“learn-it-all”成长思维。",
          "当证据挑战我的观点时，我会重新检视投资论点。我希望持续学习，而非不惜代价捍卫结论。",
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
      "我相信自由贸易带来的益处，以及资本主义的活力。",
      "我相信每个人都享有生命、自由与追求幸福的权利。",
      "我相信投资属于每一个人。我希望这份公开记录能帮助你学习、独立思考，并建立自己的投资流程。",
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
