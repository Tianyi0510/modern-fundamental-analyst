"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useMemo, useState } from "react";
import { formatPercent, formatShares, formatUsd } from "@/lib/format";
import {
  getHoldingCostPerShare,
  getHoldingReturn,
  getHoldingWeight,
  getPortfolioTotals,
  type PortfolioHolding,
} from "@/features/portfolio/portfolio-calculations";

type SortKey = "symbol" | "shares" | "costBasis" | "price" | "marketValue" | "returnPct" | "weight";
type SortDirection = "asc" | "desc";

type PortfolioTableProps = {
  copy: PortfolioTableCopy;
  holdings: ReadonlyArray<PortfolioHolding>;
  income: { netDividends: number; financingInterest: number };
};

export type PortfolioTableCopy = Record<SortKey, string> & {
  ariaLabel: string;
  ascending: string;
  descending: string;
  sortBy: string;
  total: string;
};

const columns: SortKey[] = ["symbol", "shares", "price", "costBasis", "marketValue", "returnPct", "weight"];

export function PortfolioTable({ copy, holdings, income }: PortfolioTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("marketValue");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const totals = useMemo(() => getPortfolioTotals(holdings, income), [holdings, income]);
  const rows = useMemo(
    () =>
      holdings.map((holding) => ({
        holding,
        returnPct: getHoldingReturn(holding),
        costPerShare: getHoldingCostPerShare(holding),
        weight: getHoldingWeight(holding.marketValue, totals.marketValue),
      })),
    [holdings, totals.marketValue],
  );

  const sortedRows = useMemo(() => {
    const getSortValue = (row: (typeof rows)[number]) => {
      if (sortKey === "weight") return row.weight;
      if (sortKey === "returnPct") return row.returnPct;
      if (sortKey === "costBasis") return row.costPerShare;
      return row.holding[sortKey];
    };

    return rows.toSorted((a, b) => {
      const first = getSortValue(a);
      const second = getSortValue(b);
      const comparison = typeof first === "string" ? first.localeCompare(String(second)) : first - Number(second);
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [rows, sortDirection, sortKey]);

  const changeSort = (nextKey: SortKey) => {
    if (nextKey === sortKey) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(nextKey);
    setSortDirection(nextKey === "symbol" ? "asc" : "desc");
  };

  return (
    <>
      <div className="portfolio-mobile-sort">
        <label>
          <span>{copy.sortBy}</span>
          <select value={sortKey} onChange={(event) => changeSort(event.target.value as SortKey)}>
            {columns.map((column) => (
              <option value={column} key={column}>
                {copy[column]}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => setSortDirection((current) => (current === "asc" ? "desc" : "asc"))}
          aria-label={`${copy.sortBy}: ${sortDirection === "asc" ? copy.ascending : copy.descending}`}
        >
          <span>{sortDirection === "asc" ? copy.ascending : copy.descending}</span>
          {sortDirection === "asc" ? <ArrowUp aria-hidden="true" /> : <ArrowDown aria-hidden="true" />}
        </button>
      </div>
      <table className="portfolio-table portfolio-table-detailed" aria-label={copy.ariaLabel}>
        <thead>
          <tr className="table-head">
            {columns.map((column) => {
              const isActive = sortKey === column;
              const ariaSort = isActive ? (sortDirection === "asc" ? "ascending" : "descending") : "none";
              const Icon = !isActive ? ArrowUpDown : sortDirection === "asc" ? ArrowUp : ArrowDown;

              return (
                <th scope="col" aria-sort={ariaSort} key={column}>
                  <span className="portfolio-column-label">{copy[column]}</span>
                  <button
                    className={`sort-button${isActive ? " is-active" : ""}`}
                    type="button"
                    onClick={() => changeSort(column)}
                    aria-label={`${copy.sortBy} ${copy[column]}`}
                  >
                    {copy[column]} <Icon aria-hidden="true" />
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map(({ holding, costPerShare, returnPct, weight }) => (
            <tr className="portfolio-row" key={holding.symbol}>
              <th scope="row" data-label={copy.symbol}>
                {holding.symbol}
              </th>
              <td data-label={copy.shares}>{formatShares(holding.shares)}</td>
              <td data-label={copy.price}>{formatUsd(holding.price)}</td>
              <td data-label={copy.costBasis}>{formatUsd(costPerShare)}</td>
              <td data-label={copy.marketValue}>{formatUsd(holding.marketValue)}</td>
              <td data-label={copy.returnPct} className={`data-value ${returnPct < 0 ? "negative" : "positive"}`}>
                {formatPercent(returnPct, 1)}
              </td>
              <td data-label={copy.weight}>{weight.toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="portfolio-row portfolio-total-row">
            <th scope="row" data-label={copy.symbol}>
              {copy.total}
            </th>
            <td />
            <td />
            <td />
            <td className="portfolio-total-market" data-label={copy.marketValue}>
              {formatUsd(totals.marketValue)}
            </td>
            <td
              data-label={copy.returnPct}
              className={`portfolio-total-return data-value ${totals.totalReturn < 0 ? "negative" : "positive"}`}
            >
              {formatPercent(totals.totalReturn)}
            </td>
            <td />
          </tr>
        </tfoot>
      </table>
    </>
  );
}
