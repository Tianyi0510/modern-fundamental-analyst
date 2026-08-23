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

const microsoftSourceUrl = "https://docs.google.com/document/d/1X4DwJBuHM0jo77lEtBHMzmTcQSo9Xc5TkrNjcpj2yyw/edit?usp=sharing";

// The article body below mirrors the source Google Doc verbatim. Do not edit its
// prose independently; update it only from the source document.
const sourceContent: MemoContent = {
  sections: [
    {
      title: "Section 1: Business Analysis",
      subsections: [
        { title: "Introduction", paragraphs: [
          "Warren Buffett’s most important investing principle is understanding the business in which you’re investing. Buffett once said, “If you don’t understand a business, you shouldn’t own it.”",
          "When you buy a stock, you’re not just buying a ticker symbol or a line on a chart. You’re buying partial ownership in an actual business. Most people lose money in the stock market because they focus on predicting stock price movements instead of understanding business fundamentals. They’re essentially gambling, not investing.",
        ] },
        { title: "Framework for Understanding Business", paragraphs: [
          "So how can you actually understand a business like Buffett does? Just follow this three-part framework:",
          "First, analyze how the company generates revenue. This sounds obvious, but you’d be surprised how many investors can’t clearly explain how the companies they invested in make money.",
          "Second, identify the company’s competitive advantages or what Buffett calls “economic moats,” which represents the enduring advantages a company possesses that safeguard its profitability from the pressures of competition, such as cost advantages derived from economies of scale, high switching costs that deter customers from moving to competitors, or network effects where the value of a product or service increases with the number of users.",
          "Third, assess the company’s growth prospects. Has the company demonstrated consistent historical growth? Is it operating in an expanding industry? Does it hold a leading position within its industry? What opportunities exist for its future expansion?",
        ] },
        { title: "Microsoft Overview ", paragraphs: [
          "Now, let’s apply this framework to one of the world’s most valuable companies: Microsoft.",
          "Microsoft stands as a dominant force in the global technology landscape today, but it’s almost unrecognizable from the Microsoft of a decade ago. Microsoft has experienced a significant transformation, shifting from a Windows-centric business model to one centered on cloud computing and artificial intelligence.",
          "Microsoft now operates through three primary business segments: Productivity and Business Processes, Intelligent Cloud, and More Personal Computing. Of these, the Intelligent Cloud and Productivity & Business Processes segments are particularly noteworthy due to their significant contributions to the company’s overall growth and their direct relevance to the themes of cloud computing and artificial intelligence.",
        ] },
        { title: "Intelligent Cloud Segment", paragraphs: [
          "Let’s start with the Intelligent Cloud segment, Microsoft’s fastest-growing segment.",
          "The Intelligent Cloud segment represents Microsoft’s strategic transformation into the future of computing. But wait, what is cloud, and how does Microsoft make money from it?",
          "Cloud refers to cloud computing, which is essentially a utility model for technology. Instead of businesses building their own expensive data centers, they rent computing power, storage, and services from cloud providers’ global infrastructure. Azure, Microsoft’s cloud computing platform, is one of the most competitive platforms in the market.",
          "Beyond Azure, the segment includes server products, enterprise services, and developer tools designed for businesses that still run some operations on their own servers. Microsoft sells the software that powers those servers, often with ongoing support contracts that provide stable, recurring revenue.",
          "Since the launch of ChatGPT, we’ve seen an explosion in cloud demand, as the intricate AI models underpinning technologies like ChatGPT necessitate immense computational power and vast data storage capabilities. ",
          "Azure has powerful economic moats when facing competitors such as AWS and Google Cloud, primarily due to its more comprehensive enterprise ecosystem, which integrates cloud infrastructure with Microsoft’s portfolio, including Office 365, LinkedIn, and Dynamics 365, compared to AWS’s primarily infrastructure-focused offerings. More importantly, its significant AI leadership, achieved through early GenAI investments and strategic OpenAI partnerships, has resulted in Azure accounting for 45% of new cloud AI case studies and 29% of the market share, creating a powerful differentiator as enterprises increasingly prioritize AI capabilities in their cloud strategies. In fact, while AWS currently holds a larger share of the cloud market, Azure is rapidly closing the gap with the market leader through greater growth momentum, positioning Azure to potentially overtake AWS by 2026, with projected revenue of $149.6 billion.",
        ] },
        { title: "Productivity and Business Processes Segment", paragraphs: [
          "Now, let’s explore Microsoft’s Productivity and Business Processes segment, which includes the widely adopted Microsoft 365 suite, along with LinkedIn and Dynamics products, generating revenues in both commercial and consumer markets by collecting subscription fees.",
          "The suite’s core applications, such as Word, Excel, PowerPoint, Outlook, and Teams, have become indispensable for daily business operations across various industries, creating a strong foundation for recurring revenue and a significant economic moat due to the high irreplaceability of these tools.",
          "Furthermore, after the announcement of ChatGPT, Microsoft decided to embed AI deeply within its productivity offerings, resulting in the birth of Microsoft Copilot, an AI-powered assistant that seamlessly integrates into Microsoft 365 applications. This integration has led to substantial gains in user efficiency and satisfaction, causing an incredible boom in this sector before experiencing a subsequent slowdown. However, some recent news suggests the story seems far from over.",
          "A recent research report by Goldman Sachs Research suggests that Software and IT services stocks are well-positioned, as their tools enable other companies to adopt new AI technologies. And Microsoft is undoubtedly the most likely one to gain in this phase. In fact, Microsoft Fabric, an AI-powered data analytics platform, has become one of the fastest-growing platforms in Microsoft history.",
        ] },
        { title: "Investment Conclusion", paragraphs: [
          "In conclusion, Microsoft’s Intelligent Cloud is already skyrocketing with 30% annual growth, while its Productivity and Business Process segment is quietly building pressure for its next explosive breakout.",
        ] },
      ],
    },
    {
      title: "Section 2: Management Analysis",
      subsections: [
        { title: "Introduction", paragraphs: [
          "Now that we’ve seen how strong Microsoft’s business is, let’s turn our attention to the management behind this remarkable performance. You may be surprised that we dedicate an entire section to assess management capabilities. However, Benjamin Graham, Warren Buffett’s teacher, claims that management is one of the most important factors in evaluating a leading company. With this in mind, let’s assess Microsoft’s management team under Satya Nadella.",
        ] },
        { title: "Framework for Assessing Management", paragraphs: [
          "Before diving into the details, let me introduce how we’ll assess Microsoft’s management team: As before, I’ve divided this section into three distinct groups.",
          "The first group is ethical leadership: Jeff Bezos once said, “It’s harder to be kind than be clever.” It is very important that we thoroughly evaluate the integrity, transparency, and values demonstrated by the management team before investing in them.",
          "The second group is operational excellence, which needs no description. In this group, we’ll assess their ability to execute strategies, allocate capital, and integrate various business lines.",
          "The third, and final, group is strategic vision: Buffett is often quoted as saying, “If you don’t want to own a company for 10 years, don’t own it for 10 minutes.” It is crucial to ensure that the management team focuses on long-term success rather than merely pursuing short-term profits. In fact, about one-third of the S&P 500 changes every 10 years. In this group, we’ll analyze the leadership’s long-term vision and their ability to guide the company in a rapidly evolving industry.",
        ] },
        { title: "Microsoft Management Analysis", paragraphs: [
          "Let’s now put this framework into action with Satya Nadella, the current CEO of Microsoft.",
          "Satya Nadella’s ethical leadership is a masterclass in transforming a rigid, “know-it-all” corporate culture into a dynamic, “learn-it-all” ecosystem. He achieved this by shifting Microsoft’s focus from internal competition to a deep, empathetic obsession with the customer. By championing a growth mindset, he reframed failure as a valuable learning opportunity, dismantling the fear-based “stack ranking” system and fostering a culture of psychological safety. His leadership is not one of command and control, but of curiosity and empowerment, proving that a culture built on empathy and self-awareness is not just a more humane way to work, but an exponentially more successful one. ",
          "Shifting gears to operational excellence, Microsoft’s management team, under Satya Nadella, doesn’t just set high goals—it achieves them through disciplined execution. In the 2024 shareholders’ letter, Satya discussed Microsoft’s three priorities going forward: First, prioritize fundamentals, with security above all else, which led to the launch of the Secure Future Initiative (SFI) to advance cybersecurity protection across the organization. Second, drive trustworthy AI innovation across the entire portfolio while continuing to scale the cloud business. And finally, manage the company’s cost structure dynamically to generate durable, long-term operating leverage. Every decision is driven by a careful balance between short-term performance and long-term sustainability, which strengthens Microsoft’s competitive positioning and aligns with Buffett’s emphasis on operational excellence.",
          "Now, let’s discuss his strategic vision, which, in my opinion, is what sets great leaders apart. In 2019, Nadella Satya made a strategic bet on artificial intelligence with a $1 billion investment in OpenAI—a move that evolved into a multi-billion dollar partnership, positioning Microsoft at the forefront of AI innovation. Additionally, Nadella’s focus on cloud computing and emerging technologies demonstrates his proactive approach to setting trends rather than following them.",
        ] },
        { title: "Investment Conclusion", paragraphs: [
          "To wrap it up, Satya Nadella’s journey at Microsoft is an inspiring story of how a leader with vision, empathy, and an innovative mindset can transform a company’s fortunes. According to Brand Finance’s 2025 Brand Guardianship Index, Microsoft CEO Satya Nadella ranks as the top brand guardian among the world’s 100 leading CEOs. Since taking the reins in 2014, Nadella has redefined Microsoft, transforming it into one of the world’s most valuable companies.",
        ] },
      ],
    },
    {
      title: "Section 3: Financial Analysis",
      subsections: [
        { title: "Introduction", paragraphs: [
          "Having seen how Satya Nadella’s transformative leadership at Microsoft has redefined the company’s trajectory, it’s time to shift our focus to Microsoft’s financials. While Nadella’s exceptional leadership lays the foundation for success, understanding the numbers behind that success is just as crucial. Buffett once said, “Accounting is the language of business.” For value investors, mastering this language is the key to identify quality companies at fair prices.",
        ] },
        { title: "Framework for Financial Analysis", paragraphs: [
          "To evaluate a company’s overall financial health, we can use a simple yet powerful three-part framework: growth, profitability, and liquidity. ",
          "Growth, which contains both revenue growth and margin expansion, indicates whether the company is successful in attracting new customers, entering new markets, and adapting its offerings to meet evolving customers’ needs. ",
          "Profitability, typically measured by profit margins, reflects how effectively the company manages costs and leverages its pricing power.",
          "Liquidity indicates whether a company maintains a robust financial foundation—with sufficient cash reserves and manageable debt levels—to navigate challenges and seize new opportunities.",
          "With this framework in mind, you can easily interpret financial statements and identify the key insights.",
        ] },
        { title: "Microsoft Financial Analysis", paragraphs: [
          "Starting with growth, Microsoft has demonstrated impressive consistency. In fiscal year 2024, its revenue reached $245.1 billion—a 16% increase from $211.9 billion in the previous year. Looking back, in 2019, revenue was $125.8 billion, representing a 5-year compound annual growth rate (CAGR) of 14.3%. Additionally, net income grew from $39.2 billion in 2019 to $88.1 billion in 2024 with a 5-year CAGR of 17.6%. This strong growth also contributed to margin expansion, as the bottom line (net income) outpaced the top line (net revenue or sales).",
          "Turning to profitability, Microsoft demonstrated impressive margins in 2024. Its gross margin, which reflects profitability after subtracting direct costs from revenue, reached 69.8%, far exceeding Buffett‘s target of 40%. Meanwhile, its operating margin, which considers all operating expenses, increased from 41.8% to 44.6% over the past two years, also meeting Buffett’s benchmark. Buffett has repeatedly emphasized the significance of ROE and ROIC, asserting that a sound investment should maintain an average ROE above 20% over the past decade. Remarkably, Microsoft’s Return on Equity (ROE) stands at an impressive 32.8%, meaning it generates 32.8 cents of profit for each dollar invested by shareholders. Its Return on Invested Capital (ROIC) is 31.2%, also surpassing Buffett’s benchmark.",
          "As for liquidity, Microsoft’s financials are incredibly healthy. In 2024, the company held $75.5 billion in highly liquid assets, including cash, cash equivalents, and short-term investments—funds that are easily accessible when needed. On the debt side, Microsoft owed $51.6 billion, resulting in a net cash position of $23.9 billion, meaning it has $23.9 billion more in liquid assets than debt. Its debt-to-equity ratio is a modest 0.192 (or 19.2%) and trending downward, well below Buffett’s conservative benchmark of 0.5. This indicates minimal reliance on borrowed funds and lower overall financial risk. Additionally, Microsoft holds 25% more in short-term assets than in short-term liabilities, ensuring it can comfortably cover its upcoming obligations. Furthermore, Microsoft‘s retained earnings surged from $24.2 billion in 2019 to $173.2 billion in 2024. Buffett values the consistent increase in retained earnings, as it demonstrates the company’s strategic reinvestment of profits to fuel sustainable growth and bolster long-term shareholder value. This strong balance sheet not only protects the company but also provides the funds needed for growth, acquisitions, dividends, and share buybacks. A company with this strength and flexibility is well-positioned for long-term success.",
        ] },
        { title: "Investment Conclusion", paragraphs: [
          "In conclusion, Microsoft’s financials satisfy all of Buffett‘s benchmarks. Its revenue consistently increases across all segments; its profitability is exceptional, with strong margins and high returns that operate like a well-oiled money machine, and its balance sheet is solid, maintaining ample cash reserves and minimal debt. For beginner investors seeking an attractive investment opportunity, Microsoft’s robust financial health makes it a compelling choice.",
        ] },
      ],
    },
  ],
  referencesTitle: "References:",
  references: [
    "Cohan, P. (2024, February 13). Why Microsoft Azure could take the cloud lead from Amazon AWS by 2026. Forbes. ",
    "Forrester Consulting. (2024, May). The Total Economic Impact™ of Microsoft Fabric. Microsoft.",
    "Brand Finance. (2025). Brand Guardianship Index 2025.",
    "Microsoft Corporation. (2024). Microsoft Fiscal Year 2024 Annual Report.",
    "Buffett, W. (1988). 1987 Letter to Shareholders. In Berkshire Hathaway Inc. 1987 Annual Report.",
  ],
  sourceLabel: "Source document: Microsoft Stock Analysis Fiscal Year 2024",
  sourceUrl: microsoftSourceUrl,
};

const microsoftContentByLocale = {
  en: sourceContent,
  "zh-tw": { ...sourceContent, sourceLabel: "來源文件：Microsoft Stock Analysis Fiscal Year 2024" },
  "zh-cn": { ...sourceContent, sourceLabel: "来源文件：Microsoft Stock Analysis Fiscal Year 2024" },
} as const;

export const memoContentBySlug = {
  "microsoft-stock-analysis-fy2024": microsoftContentByLocale,
} as const;

export function getMemoContent(slug: string, locale: "en" | "zh-tw" | "zh-cn") {
  return memoContentBySlug[slug as keyof typeof memoContentBySlug]?.[locale];
}
