import { render, screen, within } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { PortfolioPageContent } from "./portfolio-page-content";
import { portfolioHoldings, portfolioSnapshot } from "@/features/portfolio/portfolio";
import { getLocalizedPath } from "@/lib/i18n";
import { formatDate, formatUsd, formatPercent } from "@/lib/format";

vi.mock("@/features/portfolio/portfolio-twr", () => ({ portfolioTwrSnapshot: { priceDate: "2026-10-30" } }));
vi.mock("@/components/site-header/site-header", () => ({ SiteHeader: () => null }));
vi.mock("./page-footer", () => ({ PageFooter: () => null }));

it.each([
  { locale: "en", name: "Portfolio holdings", position: "Sort by Position", total: "Total" },
  { locale: "zh-tw", name: "投資組合持股", position: "排序依據 部位", total: "合計" },
  { locale: "zh-cn", name: "投资组合持仓", position: "排序依据 持仓", total: "合计" },
] as const)(
  "renders the $locale holdings with localized controls and reconciled totals",
  ({ locale, name, position, total }) => {
    render(<PortfolioPageContent locale={locale} />);
    const valuation = formatDate(portfolioSnapshot.asOf, locale, locale === "en");
    const close = formatDate("2026-10-30", locale, locale === "en");
    const valuationNote = {
      en: `The ${valuation} valuation uses closing prices from ${close}.`,
      "zh-tw": `${valuation} 的持股市值按 ${close} 的收盤價計算。`,
      "zh-cn": `${valuation} 的持仓市值按 ${close} 的收盘价计算。`,
    };
    expect(screen.getByText(valuationNote[locale], { exact: false })).toBeVisible();
    const table = screen.getByRole("table", { name });
    expect(within(table).getByRole("button", { name: position })).toBeVisible();
    for (const holding of portfolioHoldings) {
      expect(within(table).getByRole("link", { name: holding.symbol })).toHaveAttribute(
        "href",
        getLocalizedPath(`/portfolio/${holding.symbol.toLowerCase()}`, locale),
      );
    }
    const totalRow = within(table).getByRole("row", { name: new RegExp(`^${total} `) });
    expect(totalRow).toHaveTextContent(formatUsd(portfolioSnapshot.marketValue));
    expect(totalRow).toHaveTextContent(formatPercent(portfolioSnapshot.totalReturn));
    expect(screen.getAllByRole("table")).toHaveLength(1);
  },
);
