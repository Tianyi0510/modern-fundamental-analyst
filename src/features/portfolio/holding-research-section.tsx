import { Container } from "@/components/container";
import { formatDate } from "@/lib/format";
import { localeConfig, type Locale } from "@/lib/i18n";
import { getHoldingResearch } from "./holding-research";

const copy = {
  en: {
    company: "Company Fundamentals",
    fund: "Fund Profile",
    year: "Fiscal year ended",
    filed: "Filed",
    fundDate: "Fact sheet period ended",
    industry: "SEC industry (SIC)",
    ir: "Investor relations",
    growth: "Revenue growth (YoY)",
    net: "Net income attributable to common shareholders",
    cashRatio: "Operating cash flow / revenue",
    assets: "Total Assets",
    revenue: "Revenue",
    cash: "Operating Cash Flow",
    units: "USD millions",
    fee: "Annual Expense Ratio",
    launch: "Inception Date",
    report: "Annual report (10-K)",
    filings: "All SEC filings",
    sheet: "Fund fact sheet (PDF)",
    holdings: "Fund profile and holdings",
  },
  "zh-tw": {
    company: "公司基本面",
    fund: "基金概況",
    year: "會計年度截至",
    filed: "申報日期",
    fundDate: "基金資料截至",
    industry: "SEC 產業分類（SIC）",
    ir: "投資人關係官網",
    growth: "營收年增率",
    net: "歸屬於普通股股東的淨利",
    cashRatio: "營業現金流占營收比率",
    assets: "總資產",
    revenue: "營收",
    cash: "營業現金流",
    units: "百萬美元",
    fee: "年度費用率",
    launch: "成立日期",
    report: "年度報告（10-K）",
    filings: "全部 SEC 申報文件",
    sheet: "基金資料表（PDF）",
    holdings: "基金概況與持股",
  },
  "zh-cn": {
    company: "公司基本面",
    fund: "基金概况",
    year: "财年截至",
    filed: "申报日期",
    fundDate: "基金资料截至",
    industry: "SEC 行业分类（SIC）",
    ir: "投资者关系官网",
    growth: "营收同比增长率",
    net: "归属于普通股股东的净利润",
    cashRatio: "经营现金流占营收比例",
    assets: "总资产",
    revenue: "营业收入",
    cash: "经营现金流",
    units: "百万美元",
    fee: "年度费用率",
    launch: "成立日期",
    report: "年度报告（10-K）",
    filings: "全部 SEC 申报文件",
    sheet: "基金资料表（PDF）",
    holdings: "基金概况与持仓",
  },
};

export function HoldingResearchSection({ symbol, locale }: { symbol: string; locale: Locale }) {
  const profile = getHoldingResearch(symbol);
  const text = copy[locale];
  const company = profile.kind === "company";
  const millions = new Intl.NumberFormat(localeConfig[locale].htmlLang, { maximumFractionDigits: 3 });
  const percent = new Intl.NumberFormat(localeConfig[locale].htmlLang, { style: "percent", maximumFractionDigits: 2 });
  const metrics =
    profile.kind === "company"
      ? [
          [text.revenue, millions.format(profile.revenue / 1_000_000), text.units],
          [text.growth, percent.format(profile.revenue / profile.priorRevenue - 1)],
          [text.net, millions.format(profile.netIncomeToCommon / 1_000_000), text.units],
          [text.assets, millions.format(profile.assets / 1_000_000), text.units],
          [text.cash, millions.format(profile.operatingCashFlow / 1_000_000), text.units],
          [text.cashRatio, percent.format(profile.operatingCashFlow / profile.revenue)],
        ]
      : [
          [text.fee, `${profile.expenseRatio.toFixed(2)}%`],
          [text.launch, formatDate(profile.inception, locale, true)],
        ];
  return (
    <Container
      as="section"
      aria-labelledby="holding-research"
      className="grid gap-y-[var(--space-section-content)] border-b border-border py-[var(--space-section-padding)] min-[1101px]:grid-cols-[var(--grid-columns)] min-[1101px]:gap-x-[var(--grid-column-gap)]"
    >
      <div className="min-w-0 min-[1101px]:col-span-4">
        <h2 id="holding-research" className="m-0 text-small-headline text-brand">
          {company ? text.company : text.fund}
        </h2>
        <p className="mt-[var(--space-heading-prose)] text-small-body">
          {company ? text.year : text.fundDate}{" "}
          <time dateTime={profile.periodEnd}>{formatDate(profile.periodEnd, locale, true)}</time>
        </p>
        {profile.kind === "company" && (
          <p className="mt-[var(--space-8px)] text-small-body">
            {text.filed} <time dateTime={profile.filed}>{formatDate(profile.filed, locale, true)}</time>
          </p>
        )}
      </div>
      <div className="min-w-0 min-[1101px]:col-span-8">
        <p className="m-0 max-w-[var(--width-reading)] text-large-body">{profile.business[locale]}</p>
        {profile.kind === "company" && (
          <dl className="mt-[var(--space-32px)]">
            <dt className="text-large-label">{text.industry}</dt>
            <dd className="m-0 mt-2 text-small-body" lang="en">
              {profile.industry}
            </dd>
          </dl>
        )}
        <dl className="my-[var(--space-section-content)] grid gap-x-[var(--space-24px)] gap-y-[var(--space-32px)] min-[801px]:grid-cols-2 [dl+&]:mt-[var(--space-32px)]">
          {metrics.map(([label, value, unit]) => (
            <div
              key={label}
              className="relative flex flex-col gap-[var(--space-8px)] before:absolute before:inset-x-0 before:-top-[var(--space-16px)] before:border-t before:border-border"
            >
              <dt className="text-large-label">
                {label}
                {unit && <span className="ml-2 text-small-body">({unit})</span>}
              </dt>
              <dd className="m-0 mt-auto text-medium-title tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="flex flex-wrap gap-x-[var(--space-24px)] gap-y-[var(--space-8px)] text-small-body">
          {profile.kind === "company" && (
            <a className="underline underline-offset-4" href={profile.investorRelations}>
              {text.ir}
            </a>
          )}
          <a className="underline underline-offset-4" href={profile.report}>
            {company ? text.report : text.sheet}
          </a>
          <a className="underline underline-offset-4" href={profile.issuer}>
            {company ? text.filings : text.holdings}
          </a>
        </div>
      </div>
    </Container>
  );
}
