export type MemoContent = {
  sections: Array<{
    title: string;
    introduction?: string[];
    subsections: Array<{ title: string; paragraphs: string[] }>;
  }>;
  referencesTitle: string;
  references: string[];
  sourceLabel: string;
  sourceUrl: string;
};

const english: MemoContent = {
  sections: [
    {
      title: "Business Analysis",
      introduction: [
        "When buying a stock, an investor is acquiring partial ownership in an operating business—not merely a ticker symbol or a line on a chart. The starting point is therefore to understand how that business generates revenue, what protects its economics from competition, and where future growth may come from.",
      ],
      subsections: [
        {
          title: "Framework for Understanding the Business",
          paragraphs: [
            "The first step is to explain clearly how the company makes money. The second is to identify durable competitive advantages, including economies of scale, high switching costs, network effects, or other structural protections. The third is to assess the company’s growth record, industry position, addressable opportunities, and capacity for future expansion.",
          ],
        },
        {
          title: "Microsoft Overview",
          paragraphs: [
            "Microsoft has transformed from a Windows-centered company into a business increasingly driven by cloud computing and artificial intelligence. It operates through three primary segments: Productivity and Business Processes, Intelligent Cloud, and More Personal Computing. The first two are especially important because of their contribution to growth and their direct exposure to cloud and AI adoption.",
          ],
        },
        {
          title: "Intelligent Cloud",
          paragraphs: [
            "The Intelligent Cloud segment represents Microsoft’s strategic shift toward the future of computing. Cloud computing allows businesses to rent computing power, storage, and related services instead of building and operating their own data centers. Azure is Microsoft’s cloud platform and one of the market’s leading competitors.",
            "The segment also includes server products, enterprise services, and developer tools for customers that retain some on-premises infrastructure. These products often carry ongoing support arrangements and contribute recurring revenue.",
            "Demand for cloud infrastructure has increased alongside generative AI because advanced models require substantial computing power and data storage. Azure’s competitive position is supported by Microsoft’s broad enterprise ecosystem, which connects cloud infrastructure with Microsoft 365, LinkedIn, Dynamics 365, developer tools, and AI capabilities developed through Microsoft’s relationship with OpenAI.",
            "The source analysis cited Azure’s share of new cloud AI case studies, its cloud market position, and a projection that Azure could narrow the gap with AWS. These projections should be treated as forward-looking assumptions rather than guaranteed outcomes.",
          ],
        },
        {
          title: "Productivity and Business Processes",
          paragraphs: [
            "This segment includes Microsoft 365, LinkedIn, and Dynamics products. Its commercial and consumer revenue is supported largely by subscriptions. Word, Excel, PowerPoint, Outlook, and Teams are deeply embedded in day-to-day business workflows, creating recurring revenue, high switching costs, and a meaningful competitive moat.",
            "Microsoft has embedded Copilot across its productivity products, positioning the company to benefit as businesses adopt AI-assisted workflows. Microsoft Fabric, its AI-powered data and analytics platform, also expands the company’s role in enterprise data infrastructure. The opportunity depends on Microsoft converting product adoption into durable customer value and attractive incremental economics.",
          ],
        },
        {
          title: "Business Conclusion",
          paragraphs: [
            "Microsoft combines a rapidly growing cloud platform with a deeply entrenched productivity ecosystem. The central investment question is whether Azure, Copilot, Fabric, and the broader Microsoft platform can sustain growth while preserving the switching costs, distribution advantages, and recurring economics that support the company’s competitive position.",
          ],
        },
      ],
    },
    {
      title: "Management Analysis",
      introduction: [
        "Business quality must be considered alongside the people responsible for strategy, execution, culture, and capital allocation. This analysis evaluates Microsoft’s management under Satya Nadella through ethical leadership, operational excellence, and strategic vision.",
      ],
      subsections: [
        {
          title: "Assessment Framework",
          paragraphs: [
            "Ethical leadership concerns the integrity, transparency, and values demonstrated by management. Operational excellence concerns the team’s ability to execute strategy, allocate capital, integrate business lines, and balance present performance with future investment. Strategic vision concerns management’s capacity to guide the company through long-term technological and industry change.",
          ],
        },
        {
          title: "Culture and Ethical Leadership",
          paragraphs: [
            "Nadella helped move Microsoft from a rigid ‘know-it-all’ culture toward a ‘learn-it-all’ growth mindset. The emphasis on empathy, curiosity, customer needs, collaboration, and learning from failure supported a more adaptive organization and reduced the internal competition associated with the company’s earlier culture.",
          ],
        },
        {
          title: "Operational Excellence",
          paragraphs: [
            "Microsoft’s stated priorities included strengthening fundamentals with security above all else, advancing trustworthy AI across the portfolio, continuing to scale the cloud business, and managing costs dynamically to create durable operating leverage. The Secure Future Initiative illustrates the company’s attempt to make cybersecurity an organization-wide operating priority.",
          ],
        },
        {
          title: "Strategic Vision",
          paragraphs: [
            "Microsoft’s 2019 investment in OpenAI grew into a larger strategic partnership and helped position the company at the center of generative AI development. Combined with Nadella’s earlier emphasis on cloud computing, the decision reflects a willingness to invest ahead of broad market adoption rather than react after an industry shift becomes obvious.",
          ],
        },
        {
          title: "Management Conclusion",
          paragraphs: [
            "Since becoming CEO in 2014, Nadella has overseen Microsoft’s transformation into a cloud- and AI-centered company. The investment case benefits from management’s cultural renewal, strategic positioning, and record of execution, but future evaluation should continue to test cybersecurity performance, AI capital discipline, ecosystem integration, and the returns produced by elevated infrastructure investment.",
          ],
        },
      ],
    },
    {
      title: "Financial Analysis",
      introduction: [
        "Financial analysis translates the business and management thesis into measurable outcomes. The framework used here considers growth, profitability, and liquidity using Microsoft’s fiscal 2024 results and longer-term historical comparisons.",
      ],
      subsections: [
        {
          title: "Growth",
          paragraphs: [
            "Microsoft generated fiscal 2024 revenue of $245.1 billion, up 16% from $211.9 billion in the prior year. Revenue increased from $125.8 billion in 2019, representing a five-year compound annual growth rate of approximately 14.3%.",
            "Net income increased from $39.2 billion in 2019 to $88.1 billion in 2024, a five-year compound annual growth rate of approximately 17.6%. Net income growing faster than revenue indicates bottom-line expansion over the period.",
          ],
        },
        {
          title: "Profitability",
          paragraphs: [
            "Microsoft’s fiscal 2024 gross margin was 69.8%. Its operating margin increased from 41.8% to 44.6% over the preceding two years. Return on equity was reported at 32.8%, while return on invested capital was reported at 31.2%. Together, these figures indicate strong pricing, operating efficiency, and returns on the capital employed in the business.",
          ],
        },
        {
          title: "Liquidity and Balance-Sheet Resilience",
          paragraphs: [
            "At fiscal year-end 2024, Microsoft held $75.5 billion of cash, cash equivalents, and short-term investments against $51.6 billion of debt, producing a net cash position of $23.9 billion. Its debt-to-equity ratio was approximately 0.192, and short-term assets exceeded short-term liabilities by roughly 25%.",
            "Retained earnings increased from $24.2 billion in 2019 to $173.2 billion in 2024. The balance sheet gives Microsoft flexibility to fund infrastructure, research, acquisitions, dividends, and share repurchases while retaining protection against operating or market stress.",
          ],
        },
        {
          title: "Financial Conclusion",
          paragraphs: [
            "Microsoft’s fiscal 2024 financial profile combined double-digit growth, high margins, strong returns on capital, and a net cash balance sheet. These strengths support the quality side of the investment thesis. A complete investment decision must still compare that quality and the durability of future cash flows with the valuation paid for the shares.",
          ],
        },
      ],
    },
  ],
  referencesTitle: "References",
  references: [
    "Cohan, P. (2024, February 13). Why Microsoft Azure Could Take the Cloud Lead from Amazon AWS by 2026. Forbes.",
    "Forrester Consulting. (2024, May). The Total Economic Impact™ of Microsoft Fabric. Microsoft.",
    "Brand Finance. (2025). Brand Guardianship Index 2025.",
    "Microsoft Corporation. (2024). Microsoft Fiscal Year 2024 Annual Report.",
    "Buffett, W. (1988). 1987 Letter to Shareholders. Berkshire Hathaway Inc.",
  ],
  sourceLabel: "Source document: Microsoft Stock Analysis Fiscal Year 2024",
  sourceUrl: "https://docs.google.com/document/d/1X4DwJBuHM0jo77lEtBHMzmTcQSo9Xc5TkrNjcpj2yyw/edit?usp=sharing",
};

const traditionalChinese: MemoContent = {
  sections: [
    {
      title: "企業分析",
      introduction: ["買入股票代表取得一家營運中企業的部分所有權，而不只是買入代號或圖表上的價格線。因此，分析的起點是理解企業如何創造收入、什麼因素保護其經濟效益免受競爭侵蝕，以及未來成長可能來自何處。"],
      subsections: [
        { title: "理解企業的框架", paragraphs: ["第一步是清楚解釋公司如何賺錢；第二步是辨認持久的競爭優勢，例如規模經濟、高轉換成本、網路效應或其他結構性保護；第三步則是評估公司的成長紀錄、產業地位、可掌握的機會，以及未來擴張能力。"] },
        { title: "微軟概覽", paragraphs: ["微軟已從以 Windows 為核心的公司，轉型為日益由雲端運算與人工智慧驅動的企業。公司主要分為生產力與商業流程、智慧雲端，以及更多個人運算三大部門；前兩者對成長的貢獻尤其重要，也直接受益於雲端與人工智慧的普及。"] },
        { title: "智慧雲端", paragraphs: ["智慧雲端部門代表微軟向未來運算模式的策略轉型。雲端運算讓企業無須自行建置及營運資料中心，而能租用運算能力、儲存空間及相關服務。Azure 是微軟的雲端平台，也是市場上的主要競爭者之一。", "此部門也包括伺服器產品、企業服務，以及供仍保留部分本地基礎設施的客戶使用的開發工具。這些產品通常附帶持續性的支援安排，並帶來經常性收入。", "生成式人工智慧需要大量運算能力與資料儲存，因此也推升雲端基礎設施需求。Azure 的競爭地位受到微軟廣泛企業生態系統支持；該系統將雲端基礎設施與 Microsoft 365、LinkedIn、Dynamics 365、開發工具，以及透過與 OpenAI 合作發展的人工智慧能力連結起來。", "原始分析引用 Azure 在新增雲端人工智慧案例中的占比、市場地位，以及其可能縮小與 AWS 差距的預測。這些預測應視為前瞻性假設，而不是保證會發生的結果。"] },
        { title: "生產力與商業流程", paragraphs: ["此部門包括 Microsoft 365、LinkedIn 與 Dynamics 產品，商業及消費者收入很大程度由訂閱支持。Word、Excel、PowerPoint、Outlook 與 Teams 已深度融入企業日常工作流程，形成經常性收入、高轉換成本與具意義的競爭護城河。", "微軟已把 Copilot 整合至多項生產力產品，使公司能受益於企業採用人工智慧輔助工作流程。人工智慧資料與分析平台 Microsoft Fabric，也擴大微軟在企業資料基礎設施中的角色。這項機會最終取決於微軟能否把產品採用轉化為持久的客戶價值與具吸引力的增量經濟效益。"] },
        { title: "企業分析結論", paragraphs: ["微軟同時擁有快速成長的雲端平台與深度扎根的生產力生態系統。投資上的核心問題，是 Azure、Copilot、Fabric 與整體微軟平台能否持續成長，同時保有支撐公司競爭地位的轉換成本、通路優勢與經常性經濟效益。"] },
      ],
    },
    {
      title: "管理層分析",
      introduction: ["企業品質必須連同負責策略、執行、文化與資本配置的管理者一起評估。本分析從道德領導、營運卓越與策略視野三方面，檢視 Satya Nadella 領導下的微軟。"],
      subsections: [
        { title: "評估框架", paragraphs: ["道德領導關注管理層展現的誠信、透明度與價值觀；營運卓越關注團隊執行策略、配置資本、整合各業務，以及平衡當期表現與未來投資的能力；策略視野則關注管理層能否帶領公司因應長期科技與產業變化。"] },
        { title: "文化與道德領導", paragraphs: ["Nadella 協助微軟從僵化的「know-it-all」文化，轉向「learn-it-all」的成長思維。對同理心、好奇心、客戶需求、協作與從失敗中學習的重視，使組織更具適應力，並降低過去企業文化中的內部競爭。"] },
        { title: "營運卓越", paragraphs: ["微軟提出的優先事項包括強化基本功並把安全置於首位、在整體產品組合中推動可信賴的人工智慧、持續擴展雲端業務，以及動態管理成本以建立持久的營運槓桿。安全未來倡議（Secure Future Initiative）反映公司試圖把網路安全提升為全組織的營運優先事項。"] },
        { title: "策略視野", paragraphs: ["微軟在 2019 年投資 OpenAI，之後發展成規模更大的策略合作關係，使公司位居生成式人工智慧發展的核心。配合 Nadella 更早以前對雲端運算的重視，這項決策顯示管理層願意在市場廣泛採用前提前投資，而不是等產業轉變已明朗後才作出反應。"] },
        { title: "管理層分析結論", paragraphs: ["Nadella 自 2014 年出任執行長以來，帶領微軟轉型為以雲端與人工智慧為核心的公司。管理層的文化革新、策略定位與執行紀錄有利於投資論點，但未來仍應持續檢視網路安全表現、人工智慧資本紀律、生態系統整合，以及高額基礎設施投資所產生的報酬。"] },
      ],
    },
    {
      title: "財務分析",
      introduction: ["財務分析把企業與管理層論點轉化為可衡量的結果。此處以微軟 2024 財政年度業績及較長期的歷史比較，從成長、獲利能力與流動性三方面進行評估。"],
      subsections: [
        { title: "成長", paragraphs: ["微軟 2024 財政年度營收為 2,451 億美元，較前一年的 2,119 億美元成長 16%。營收從 2019 年的 1,258 億美元上升，五年複合年成長率約為 14.3%。", "淨利由 2019 年的 392 億美元增至 2024 年的 881 億美元，五年複合年成長率約為 17.6%。淨利增速高於營收，顯示期內底線利潤有所擴張。"] },
        { title: "獲利能力", paragraphs: ["微軟 2024 財政年度毛利率為 69.8%，營業利益率在此前兩年間由 41.8% 上升至 44.6%。股東權益報酬率為 32.8%，投入資本報酬率為 31.2%。這些數字共同反映公司具備強勁的定價能力、營運效率，以及對投入業務資本的高報酬。"] },
        { title: "流動性與資產負債表韌性", paragraphs: ["截至 2024 財政年度末，微軟持有 755 億美元現金、約當現金及短期投資，債務為 516 億美元，因此淨現金部位為 239 億美元。公司的負債權益比約為 0.192，短期資產則較短期負債高約 25%。", "保留盈餘從 2019 年的 242 億美元增至 2024 年的 1,732 億美元。這張資產負債表讓微軟有彈性投入基礎設施、研究、收購、股利與股票回購，同時保留抵禦營運或市場壓力的能力。"] },
        { title: "財務分析結論", paragraphs: ["微軟 2024 財政年度的財務表現結合雙位數成長、高利潤率、強勁資本報酬與淨現金資產負債表，支持投資論點中的企業品質部分。完整的投資決策仍須把這些品質、未來現金流的持久性，以及買入股票時支付的估值放在一起比較。"] },
      ],
    },
  ],
  referencesTitle: "參考資料",
  references: english.references,
  sourceLabel: "來源文件：Microsoft Stock Analysis Fiscal Year 2024",
  sourceUrl: "https://docs.google.com/document/d/1X4DwJBuHM0jo77lEtBHMzmTcQSo9Xc5TkrNjcpj2yyw/edit?usp=sharing",
};

const simplifiedChinese: MemoContent = {
  sections: traditionalChinese.sections.map((section) => ({
    ...section,
    title: section.title.replace("企業", "企业").replace("管理層", "管理层").replace("財務", "财务"),
    introduction: section.introduction?.map(toSimplified),
    subsections: section.subsections.map((subsection) => ({ title: toSimplified(subsection.title), paragraphs: subsection.paragraphs.map(toSimplified) })),
  })),
  referencesTitle: "参考资料",
  references: english.references,
  sourceLabel: "来源文件：Microsoft Stock Analysis Fiscal Year 2024",
  sourceUrl: "https://docs.google.com/document/d/1X4DwJBuHM0jo77lEtBHMzmTcQSo9Xc5TkrNjcpj2yyw/edit?usp=sharing",
};

function toSimplified(value: string) {
  const traditionalToSimplified = new Map<string, string>([
    ["買", "买"], ["營", "营"], ["運", "运"], ["業", "业"], ["創", "创"], ["護", "护"], ["濟", "济"], ["爭", "争"], ["來", "来"], ["處", "处"],
    ["驟", "骤"], ["錢", "钱"], ["優", "优"], ["勢", "势"], ["網", "网"], ["錄", "录"], ["產", "产"], ["張", "张"], ["從", "从"], ["轉", "转"],
    ["為", "为"], ["雲", "云"], ["與", "与"], ["達", "达"], ["門", "门"], ["對", "对"], ["獻", "献"], ["獲", "获"], ["電", "电"], ["無", "无"],
    ["資", "资"], ["儲", "储"], ["間", "间"], ["還", "还"], ["發", "发"], ["戶", "户"], ["續", "续"], ["帶", "带"], ["經", "经"], ["礎", "础"],
    ["廣", "广"], ["繫", "系"], ["聯", "联"], ["實", "实"], ["場", "场"], ["預", "预"], ["測", "测"], ["視", "视"], ["證", "证"], ["訂", "订"],
    ["閱", "阅"], ["統", "统"], ["態", "态"], ["項", "项"], ["終", "终"], ["賴", "赖"], ["價", "价"], ["標", "标"], ["讀", "读"], ["誠", "诚"],
    ["團", "团"], ["執", "执"], ["當", "当"], ["變", "变"], ["導", "导"], ["協", "协"], ["應", "应"], ["動", "动"], ["進", "进"], ["將", "将"],
    ["體", "体"], ["組", "组"], ["織", "织"], ["過", "过"], ["於", "于"], ["關", "关"], ["願", "愿"], ["顯", "显"], ["層", "层"], ["紀", "纪"],
    ["檢", "检"], ["額", "额"], ["報", "报"], ["較", "较"], ["歷", "历"], ["億", "亿"], ["複", "复"], ["長", "长"], ["淨", "净"], ["潤", "润"],
    ["東", "东"], ["權", "权"], ["這", "这"], ["勁", "劲"], ["險", "险"], ["韌", "韧"], ["約", "约"], ["債", "债"], ["負", "负"], ["則", "则"],
    ["彈", "弹"], ["購", "购"], ["禦", "御"], ["壓", "压"], ["數", "数"], ["現", "现"], ["須", "须"], ["時", "时"], ["參", "参"], ["灣", "湾"],
    ["強", "强"], ["佈", "布"], ["據", "据"], ["離", "离"], ["別", "别"], ["擴", "扩"], ["稱", "称"], ["並", "并"], ["啟", "启"], ["劃", "划"],
    ["確", "确"], ["學", "学"], ["習", "习"], ["開", "开"], ["減", "减"], ["爾", "尔"], ["額", "额"], ["額", "额"], ["態", "态"], ["領", "领"],
  ]);
  return Array.from(value, (character) => traditionalToSimplified.get(character) ?? character).join("");
}

export const memoContentByLocale = {
  en: english,
  "zh-tw": traditionalChinese,
  "zh-cn": simplifiedChinese,
} as const;
