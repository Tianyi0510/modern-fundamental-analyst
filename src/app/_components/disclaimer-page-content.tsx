import { appearance } from "./disclaimer-page-content.styles";
import { PageFooter } from "@/app/_components/page-footer";
import { SiteHeader } from "@/components/site-header";
import type { Locale } from "@/lib/i18n";
import { getNavigationCopy } from "@/lib/navigation-copy";

type LegalSection = readonly [title: string, lead: string | null, paragraphs: readonly string[]];
type LegalCopy = {
  label: string;
  title: string;
  titleAccent: string | null;
  subtitle: string | null;
  sections: readonly LegalSection[];
};

const copy = {
  en: {
    label: "Disclaimer",
    title: "Legal Disclaimer and Important",
    titleAccent: "Investment Risk Disclosures",
    subtitle:
      "Please read these terms carefully before relying on any research, financial information, valuation, or performance data published on this website.",
    sections: [
      [
        "No Investment Advice",
        "Research and Education, Not Personalized Financial Advice",
        [
          "All content published on Modern Fundamental Analyst, including investment memos, portfolio disclosures, performance data, financial models, valuation estimates, and commentary, is provided solely for general informational, educational, and research purposes. Nothing on this website constitutes investment, financial, legal, accounting, or tax advice, nor an offer, solicitation, recommendation, or endorsement to buy or sell any security or financial instrument. The content does not consider any reader’s objectives, financial circumstances, risk tolerance, or individual needs. Accessing this website, subscribing to updates, or contacting the author does not create an advisory, fiduciary, broker-client, or other professional relationship. Readers should conduct independent research and consult appropriately qualified professionals before making financial decisions.",
        ],
      ],
      [
        "Investment Risks",
        "Investment Outcomes and Future Events Remain Uncertain",
        [
          "All investments involve risk, including the possible loss of principal. Past performance does not guarantee or predict future results. This website may contain forecasts, projections, price targets, intrinsic-value estimates, and other forward-looking statements based on information, assumptions, and judgments available as of the stated publication date. Actual outcomes may differ materially because of changes in company performance, competition, technology, regulation, economic conditions, financial markets, interest rates, foreign-exchange rates, or other factors. Financial models, including three-statement and discounted cash flow models, are analytical tools rather than guarantees of value or return. The author may hold or transact in securities discussed, and portfolio positions are generally disclosed monthly rather than in real time. The author undertakes no obligation to revise or update any forward-looking statement except where expressly stated.",
        ],
      ],
      [
        "Limitation of Liability",
        "Content Provided Without Warranties or Guaranteed Results",
        [
          "All content is provided on an “as is” and “as available” basis. Although reasonable efforts are made to use information believed to be reliable, no representation or warranty is made regarding its accuracy, completeness, timeliness, suitability, or continued availability. External links and third-party materials are provided for convenience only and do not constitute endorsement or independent verification. To the fullest extent permitted by applicable law, Modern Fundamental Analyst and its author disclaim liability for any loss arising from access to, use of, or reliance upon this website, including investment losses, lost profits, lost opportunities, and indirect, incidental, special, or consequential damages. Nothing in this disclaimer excludes or limits any liability or legal right that cannot lawfully be excluded or limited.",
        ],
      ],
    ],
  },
  "zh-tw": {
    label: "免責聲明",
    title: "法律免責聲明與重要",
    titleAccent: "投資風險揭露",
    subtitle: "在依賴本網站發布的研究、財務資訊、估值或績效數據之前，請仔細閱讀以下條款。",
    sections: [
      [
        "不構成投資建議",
        "研究與教育用途，並非個人化財務建議",
        [
          "Modern Fundamental Analyst 發布的所有內容，包括投資備忘錄、投資組合揭露、績效數據、財務模型、估值及評論，僅供一般資訊、教育與研究用途。本網站任何內容均不構成投資、財務、法律、會計或稅務建議，也不構成買賣任何證券或金融工具的要約、招攬、推薦或背書。內容未考慮任何讀者的目標、財務狀況、風險承受能力或個別需求。瀏覽本網站、訂閱更新或聯絡作者，均不建立投資顧問、受託、經紀客戶或其他專業關係。讀者在作出財務決策前，應自行研究並諮詢具適當資格的專業人士。",
        ],
      ],
      [
        "投資風險",
        "投資結果與未來事件仍具不確定性",
        [
          "所有投資均涉及風險，包括可能損失本金。過往績效不保證亦不能預測未來結果。本網站可能包含依據所標示發布日期當時可取得的資訊、假設與判斷所作的預測、推估、目標價、內在價值估計及其他前瞻性陳述。公司業績、競爭、科技、監管、經濟狀況、金融市場、利率、匯率或其他因素的變化，均可能令實際結果出現重大差異。包括三大財務報表與折現現金流模型在內的財務模型是分析工具，並非價值或報酬的保證。作者可能持有或交易所討論的證券，投資組合持倉一般按月揭露，而非即時更新。除非另有明確說明，作者不承擔修訂或更新任何前瞻性陳述的義務。",
        ],
      ],
      [
        "責任限制",
        "內容不附帶保證，亦不保證結果",
        [
          "所有內容均按「現狀」及「可取得」的基礎提供。雖已合理努力採用被認為可靠的資訊，但不對其準確性、完整性、及時性、適用性或持續可用性作出任何陳述或保證。外部連結及第三方資料僅為方便讀者而提供，不構成背書或獨立核實。在適用法律允許的最大範圍內，Modern Fundamental Analyst 及作者不對因存取、使用或依賴本網站而產生的任何損失承擔責任，包括投資損失、利潤損失、機會損失，以及間接、附帶、特殊或衍生損害。本免責聲明不排除或限制任何依法不得排除或限制的責任或法律權利。",
        ],
      ],
    ],
  },
  "zh-cn": {
    label: "免责声明",
    title: "法律免责声明与重要",
    titleAccent: "投资风险披露",
    subtitle: "在依赖本网站发布的研究、财务信息、估值或业绩数据之前，请仔细阅读以下条款。",
    sections: [
      [
        "不构成投资建议",
        "研究与教育用途，并非个性化财务建议",
        [
          "Modern Fundamental Analyst 发布的所有内容，包括投资备忘录、投资组合披露、业绩数据、财务模型、估值及评论，仅供一般信息、教育与研究用途。本网站任何内容均不构成投资、财务、法律、会计或税务建议，也不构成买卖任何证券或金融工具的要约、招揽、推荐或背书。内容未考虑任何读者的目标、财务状况、风险承受能力或个别需求。浏览本网站、订阅更新或联系作者，均不建立投资顾问、受托、经纪客户或其他专业关系。读者在作出财务决策前，应自行研究并咨询具备适当资格的专业人士。",
        ],
      ],
      [
        "投资风险",
        "投资结果与未来事件仍具不确定性",
        [
          "所有投资均涉及风险，包括可能损失本金。过往业绩不保证亦不能预测未来结果。本网站可能包含依据所标示发布日期当时可取得的信息、假设与判断所作的预测、推算、目标价、内在价值估计及其他前瞻性陈述。公司业绩、竞争、科技、监管、经济状况、金融市场、利率、汇率或其他因素的变化，均可能令实际结果出现重大差异。包括三大财务报表与折现现金流模型在内的财务模型是分析工具，并非价值或回报的保证。作者可能持有或交易所讨论的证券，投资组合持仓一般按月披露，而非实时更新。除非另有明确说明，作者不承担修订或更新任何前瞻性陈述的义务。",
        ],
      ],
      [
        "责任限制",
        "内容不附带保证，亦不保证结果",
        [
          "所有内容均按「现状」及「可取得」的基础提供。虽已合理努力采用被认为可靠的信息，但不对其准确性、完整性、及时性、适用性或持续可用性作出任何陈述或保证。外部链接及第三方资料仅为方便读者而提供，不构成背书或独立核实。在适用法律允许的最大范围内，Modern Fundamental Analyst 及作者不对因访问、使用或依赖本网站而产生的任何损失承担责任，包括投资损失、利润损失、机会损失，以及间接、附带、特殊或衍生损害。本免责声明不排除或限制任何依法不得排除或限制的责任或法律权利。",
        ],
      ],
    ],
  },
} as const satisfies Record<Locale, LegalCopy>;

export function DisclaimerPageContent({ locale }: { locale: Locale }) {
  const text = copy[locale];

  return (
    <div className={appearance["legal"]}>
      <SiteHeader copy={getNavigationCopy(locale)} locale={locale} />
      <main id="main-content" tabIndex={-1}>
        <section className={appearance["legal-hero"]}>
          <header className={"legal-header" + " " + appearance["shell"]}>
            <p className={appearance["eyebrow"]}>
              <span /> {text.label}
            </p>
            <h1 className={appearance.legalTitle}>
              {text.title}
              {text.titleAccent ? (
                <>
                  <br />
                  <em>{text.titleAccent}</em>
                </>
              ) : null}
            </h1>
            {text.subtitle ? <p className={appearance["legal-subtitle"]}>{text.subtitle}</p> : null}
          </header>
        </section>
        <section className={appearance["legal-body"]}>
          <div className={appearance["legal-content"] + " " + appearance["shell"]}>
            {text.sections.map(([title, lead, paragraphs], index) => {
              const SectionLabel = lead ? "p" : "h2";
              return (
                <section className={appearance["legal-section"]} key={title}>
                  <div className={appearance["legal-section-heading"]}>
                    <SectionLabel className={appearance["section-number"] + " " + appearance["legal-section-label"]}>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <span aria-hidden="true">·</span>
                      <span>{title}</span>
                    </SectionLabel>
                    {lead ? <h2 className="legal-section-lead">{lead}</h2> : null}
                  </div>
                  <div className={appearance["legal-section-copy"]}>
                    {paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </section>
      </main>
      <PageFooter locale={locale} />
    </div>
  );
}
