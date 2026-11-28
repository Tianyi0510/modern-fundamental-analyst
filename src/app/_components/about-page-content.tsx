import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { brandSurface } from "@/components/brand-surface";
import { HeadingPhrases } from "@/components/heading-phrases";
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
      "I’m Tianyi (David) Li, a student at Rutgers University–New Brunswick Honors College. This is where I share my work as an investor.",
    disciplines: "Finance · BAIT · philosophy · music",
    sections: [
      {
        label: "01 · Introduction",
        title: "The mission of Modern Fundamental Analyst",
        paragraphs: [
          "I believe investing is for everyone. The mission of Modern Fundamental Analyst is to empower every retail investor.",
          "I share what I own, why I own it, and how those investments perform.",
          "My goal is to help you understand businesses, question assumptions, and make your own investment decisions.",
        ],
      },
      {
        label: "02 · What is a modern fundamental analyst?",
        title: "Value investor in the coming waves",
        paragraphs: [
          "I start with the business: its operations, competitive position, financial statements, capital allocation, opportunities, and risks.",
          "For me, accounting is the language of business. It’s also the foundation of every financial model I build.",
          "AI and other disruptive technologies are changing the businesses I study. I use fundamental analysis to understand what those changes could mean for each company.",
        ],
      },
      {
        label: "03 · Investment philosophy",
        title: "Applying value investing principles in the AI era",
        paragraphs: [
          "Value investing shapes how I pitch a stock. Focus investing shapes how I build my portfolio.",
          "I stay within my circle of competence by focusing on businesses I can explain in my own words.",
          "Compounding takes time. That’s why patience and discipline matter to me as an investor.",
        ],
      },
      {
        label: "04 · Transparency and accountability",
        title: "Making every investment assumption open to challenge",
        paragraphs: [
          "I promote transparency and accountability by fully disclosing my portfolio and performance monthly and publishing detailed investment theses.",
          "Published research currently covers selected companies. A detailed thesis or public financial model is not yet available for every holding.",
          "I share this record so you can evaluate my reasoning and results, including mistakes, thesis changes, and periods of underperformance.",
        ],
      },
      {
        label: "05 · Research and publishing",
        title: "Timely investment memos with deep insights",
        paragraphs: [
          "I build 3-statement and DCF models to determine the intrinsic value of stocks.",
          "My investment memos explain the business, evidence, valuation, risks, and conditions that would change my thesis.",
          "Publishing my theses lets you examine my assumptions, challenge my conclusions, and evaluate new evidence independently.",
        ],
      },
      {
        label: "06 · Background",
        title: "Growing through curiosity, empathy, and continuous learning",
        paragraphs: [
          "At Rutgers, I plan to double major in finance and Business Analytics and Information Technology. I’m also considering a minor in philosophy or music.",
          "For me, being a “learn-it-all” means staying curious and listening to people who see things differently.",
          "When new evidence challenges my view, I revisit my thesis and ask what I missed.",
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
    closingTitle: "Think independently and learn continuously",
    closingParagraphs: [
      "I believe in the benefits of free trade and the dynamism of capitalism.",
      "Those beliefs go hand in hand with my respect for each person’s right to life, liberty, and the pursuit of happiness.",
      "Investing is for everyone. I hope this record helps you think independently and develop an investment process of your own.",
    ],
    legalPrefix: "For detailed legal and methodological information, see the ",
    disclaimer: "Disclaimer",
    conjunction: " and ",
    performance: "Performance",
    legalSuffix: " pages.",
  },
  "zh-tw": {
    headline: ["持續學習", ["為投資決策", "負責"]],
    introduction:
      "我是 Tianyi（David）Li，就讀於羅格斯大學新布朗斯維克分校榮譽學院。在這裡，我分享自己的投資研究與實際持股。",
    disciplines: "金融 · 商業分析與資訊科技 · 哲學 · 音樂",
    sections: [
      {
        label: "01 · 介紹",
        title: "Modern Fundamental Analyst 的使命",
        paragraphs: [
          "我相信每個人都可以投資。Modern Fundamental Analyst 的使命，是幫助每位個人投資者獨立做判斷。",
          "在這裡，你可以看到我持有哪些股票、為什麼持有，以及它們的表現如何。",
          "我希望這些紀錄能幫助你看懂企業、檢驗假設，自己做投資決定。",
        ],
      },
      {
        label: "02 · 什麼是現代基本面分析師？",
        title: "價值投資者如何看待科技變革",
        paragraphs: [
          "研究一家企業時，我先看它如何經營、在市場上如何競爭，再從財務報表和資本配置了解它面對的機會與風險。",
          "對我來說，會計是商業的語言，也是我建立每個財務模型的基礎。",
          "人工智慧和其他顛覆性科技正在改變我研究的企業。我用基本面分析來判斷，這些變化對每家公司意味著什麼。",
        ],
      },
      {
        label: "03 · 投資哲學",
        title: "在 AI 時代運用價值投資原則",
        paragraphs: [
          "提出個股投資觀點時，我從價值投資的角度評估公司；建立投資組合時，我採取集中投資的做法。",
          "我的能力圈有個簡單的界線：只專注於那些我能用自己的話說清楚的企業。",
          "複利需要時間。這也是我在投資時重視耐心與紀律的原因。",
        ],
      },
      {
        label: "04 · 透明度與問責",
        title: "公開投資假設，讓判斷接受檢驗",
        paragraphs: [
          "每個月，我都完整公開持股和績效，也會發表詳細的投資論點，讓大家能檢驗我的判斷。",
          "目前公開的研究只涵蓋部分公司。有些持股還沒有公開的詳細分析或財務模型。",
          "你可以對照這些紀錄，看看我的判斷和實際結果，包括我在哪裡犯錯、何時改變看法，以及哪些時期績效落後。",
        ],
      },
      {
        label: "05 · 研究與發布",
        title: "及時發表有深度的投資備忘錄",
        paragraphs: [
          "我用三大財務報表模型和現金流量折現（DCF）模型估算股票的內在價值。",
          "每篇投資備忘錄都會說明公司做什麼、我如何估值、有哪些證據和風險，以及什麼情況會讓我改變看法。",
          "有了這些研究，你可以檢視我的假設、挑戰我的結論，也可以自行判斷新的證據。",
        ],
      },
      {
        label: "06 · 背景",
        title: "以好奇心、同理心與持續學習成長",
        paragraphs: [
          "在羅格斯大學，我計畫雙主修金融與「商業分析及資訊科技」，也在考慮輔修哲學或音樂。",
          "對我來說，保持好學，就是對事物抱持好奇，也願意聽聽和自己看法不同的人怎麼想。",
          "當新的證據和原先的看法不一致，我會重新檢視投資論點，問自己漏掉了什麼。",
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
        items: ["對投資判斷一定正確的保證", "買入或賣出任何特定證券的建議", "獨立研究或專業財務建議的替代品"],
      },
    ],
    closingLabel: "結語",
    closingTitle: "獨立思考，持續學習",
    closingParagraphs: [
      "我相信自由貿易能帶來好處，也相信資本主義的活力。",
      "這些信念與我對個人權利的重視一脈相承：每個人都享有生命、自由與追求幸福的權利。",
      "每個人都可以投資。我希望這份紀錄能幫助你獨立思考，逐步建立適合自己的投資方法。",
    ],
    legalPrefix: "更詳細的法律與方法資訊，請參閱",
    disclaimer: "免責聲明",
    conjunction: "與",
    performance: "績效",
    legalSuffix: "頁面。",
  },
  "zh-cn": {
    headline: ["持续学习", ["为投资决策", "负责"]],
    introduction:
      "我是 Tianyi（David）Li，就读于罗格斯大学新布朗斯维克分校荣誉学院。在这里，我分享自己的投资研究和实际持仓。",
    disciplines: "金融 · 商业分析与信息技术 · 哲学 · 音乐",
    sections: [
      {
        label: "01 · 介绍",
        title: "Modern Fundamental Analyst 的使命",
        paragraphs: [
          "我相信每个人都可以投资。Modern Fundamental Analyst 的使命，是帮助每位个人投资者独立做判断。",
          "在这里，你可以看到我持有哪些股票、为什么持有，以及它们的表现如何。",
          "希望这些记录能帮你看懂企业、检验假设，自己做投资决定。",
        ],
      },
      {
        label: "02 · 什么是现代基本面分析师？",
        title: "价值投资者如何看待技术变革",
        paragraphs: [
          "研究一家企业时，我先看它怎么经营、在市场上怎么竞争，再从财务报表和资本配置了解它面临的机会和风险。",
          "对我来说，会计是商业的语言，也是我建立每个财务模型的基础。",
          "人工智能和其他颠覆性技术正在改变我研究的企业。我用基本面分析来判断，这些变化对每家公司意味着什么。",
        ],
      },
      {
        label: "03 · 投资哲学",
        title: "在 AI 时代运用价值投资原则",
        paragraphs: [
          "分析一只股票的投资价值时，我从价值投资的角度评估公司；构建投资组合时，我采取集中投资的策略。",
          "我的能力圈有一条简单的界线：只关注那些我能用自己的话讲清楚的企业。",
          "复利需要时间。这也是我在投资中看重耐心和纪律的原因。",
        ],
      },
      {
        label: "04 · 透明度与问责",
        title: "公开投资假设，让判断接受检验",
        paragraphs: [
          "每个月，我都完整披露持仓和业绩，也会发表详细的投资分析，让大家能检验我的判断。",
          "目前公开的研究只覆盖部分公司。有些持仓还没有公开的详细分析或财务模型。",
          "你可以对照这些记录，看看我的判断和实际结果，包括我在哪里犯了错、什么时候改变了看法，以及哪些时期业绩落后。",
        ],
      },
      {
        label: "05 · 研究与发布",
        title: "及时发表有深度的投资备忘录",
        paragraphs: [
          "我用三大财务报表模型和现金流折现（DCF）模型估算股票的内在价值。",
          "每篇投资备忘录都会说明公司做什么、我如何估值、有哪些证据和风险，以及什么情况会让我改变看法。",
          "有了这些研究，你可以检验我的假设、质疑我的结论，也可以独立判断新的证据。",
        ],
      },
      {
        label: "06 · 背景",
        title: "以好奇心、同理心与持续学习成长",
        paragraphs: [
          "在罗格斯大学，我计划攻读金融和“商业分析与信息技术”两个专业，也在考虑辅修哲学或音乐。",
          "对我来说，保持好学，就是对事物保持好奇，也愿意听听和自己看法不同的人怎么想。",
          "当新的证据与原来的看法不一致时，我会重新审视自己的投资逻辑，问问自己忽略了什么。",
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
        items: ["对投资判断一定正确的保证", "买入或卖出任何特定证券的建议", "独立研究或专业财务建议的替代品"],
      },
    ],
    closingLabel: "结语",
    closingTitle: "独立思考，持续学习",
    closingParagraphs: [
      "我相信自由贸易能带来好处，也相信资本主义的活力。",
      "这些信念也体现在我对个人权利的重视上：每个人都享有生命、自由和追求幸福的权利。",
      "每个人都可以投资。希望这份记录能帮你独立思考，逐步形成适合自己的投资方法。",
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
                <HeadingPhrases text={text.headline[1]} />
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
                <p className={appearance["section-number"] + " " + appearance["about-section-label"]}>
                  <span>{number}</span>
                  <span aria-hidden="true">·</span>
                  <span>{sectionName}</span>
                </p>
                <h2 className={appearance["about-section-heading"]}>{section.title}</h2>
                <div className={appearance["about-copy"]}>
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            </div>
          );
        })}
        <div className="@container/boundaries relative isolate bg-[var(--surface-inverse)] before:absolute before:inset-y-0 before:right-0 before:-z-10 before:w-1/2 before:bg-[var(--surface-highlight)]">
          <section className={appearance.shell + " " + appearance["about-boundaries"]}>
            {text.boundaries.map((boundary, index) => (
              <section key={boundary.title} className={index === 1 ? brandSurface : undefined}>
                <Card variant="plain" className={appearance.shell + " min-[1101px]:mx-0 min-[1101px]:w-full"}>
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
        </div>
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
