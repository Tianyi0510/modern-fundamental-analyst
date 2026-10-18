"use client";

import { appearance } from "./portfolio-table.styles";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useMemo, useState } from "react";
import {
  createColumnHelper,
  createSortedRowModel,
  rowSortingFeature,
  tableFeatures,
  useTable,
  type SortingState,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { DataTable } from "@/components/ui/data-table";
import { TableCell, TableFooter, TableHead, TableRow } from "@/components/ui/table";
import { formatPercent, formatShares, formatUsd } from "@/lib/format";
import {
  getHoldingCostPerShare,
  getHoldingReturn,
  getHoldingWeight,
  getPortfolioTotals,
  type PortfolioHolding,
} from "@/features/portfolio/portfolio-calculations";

type SortKey = "symbol" | "shares" | "costBasis" | "price" | "marketValue" | "returnPct" | "weight";

type PortfolioTableProps = {
  copy: PortfolioTableCopy;
  holdings: ReadonlyArray<PortfolioHolding>;
  income: { netDividends: number; financingInterest: number };
};

export type PortfolioTableCopy = Record<SortKey, string> & {
  ariaLabel: string;
  empty: string;
  ascending: string;
  descending: string;
  sortBy: string;
  total: string;
};

const columns: SortKey[] = ["symbol", "shares", "price", "costBasis", "marketValue", "returnPct", "weight"];

type HoldingRow = {
  holding: PortfolioHolding;
  returnPct: number;
  costPerShare: number;
  weight: number;
};
const features = tableFeatures({ rowSortingFeature, sortedRowModel: createSortedRowModel() });
const columnHelper = createColumnHelper<typeof features, HoldingRow>();

export function PortfolioTable({ copy, holdings, income }: PortfolioTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "marketValue", desc: true }]);
  const sortKey = sorting[0]!.id as SortKey;
  const sortDirection = sorting[0]!.desc ? "desc" : "asc";
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

  const changeSort = (nextKey: SortKey) => {
    setSorting([{ id: nextKey, desc: nextKey === sortKey ? sortDirection === "asc" : nextKey !== "symbol" }]);
  };
  const tableColumns = useMemo(
    () =>
      columnHelper.columns(
        columns.map((column) =>
          columnHelper.accessor(
            (row) => {
              if (column === "weight") return row.weight;
              if (column === "returnPct") return row.returnPct;
              if (column === "costBasis") return row.costPerShare;
              return row.holding[column];
            },
            {
              id: column,
              header: () => {
                const active = sortKey === column;
                const Icon = !active ? ArrowUpDown : sortDirection === "asc" ? ArrowUp : ArrowDown;
                return (
                  <>
                    <span className={appearance["portfolio-column-label"]}>{copy[column]}</span>
                    <Button
                      variant="quiet"
                      size="text"
                      className={`min-h-0 justify-start rounded-none px-0 ${appearance["sort-button"]} ${column !== "symbol" ? appearance.sortAlignment : ""} ${active ? appearance["is-active"] : ""}`}
                      type="button"
                      onClick={() =>
                        setSorting([
                          { id: column, desc: column === sortKey ? sortDirection === "asc" : column !== "symbol" },
                        ])
                      }
                      aria-label={`${copy.sortBy} ${copy[column]}`}
                    >
                      {copy[column]} <Icon aria-hidden="true" />
                    </Button>
                  </>
                );
              },
              sortFn: (a, b) => {
                const first = a.getValue<string | number>(column);
                const second = b.getValue<string | number>(column);
                return typeof first === "string" ? first.localeCompare(String(second)) : first - Number(second);
              },
            },
          ),
        ),
      ),
    [copy, sortKey, sortDirection],
  );
  const table = useTable({
    features,
    columns: tableColumns,
    data: rows,
    state: { sorting },
    onSortingChange: setSorting,
    enableSortingRemoval: false,
    enableMultiSort: false,
    getRowId: (row) => row.holding.symbol,
  });

  return (
    <>
      <div className={appearance["portfolio-mobile-sort"]}>
        <label className={appearance.mobileLabel}>
          <span className={appearance.mobileHeading}>{copy.sortBy}</span>
          <NativeSelect
            className={appearance.mobileSelect}
            value={sortKey}
            onChange={(event) => changeSort(event.target.value as SortKey)}
          >
            {columns.map((column) => (
              <option value={column} key={column}>
                {copy[column]}
              </option>
            ))}
          </NativeSelect>
        </label>
        <Button
          variant="quiet"
          size="text"
          className={appearance.mobileDirection}
          type="button"
          onClick={() => changeSort(sortKey)}
          aria-label={`${copy.sortBy}: ${sortDirection === "asc" ? copy.ascending : copy.descending}`}
        >
          <span>{sortDirection === "asc" ? copy.ascending : copy.descending}</span>
          {sortDirection === "asc" ? (
            <ArrowUp className={appearance.mobileArrow} aria-hidden="true" />
          ) : (
            <ArrowDown className={appearance.mobileArrow} aria-hidden="true" />
          )}
        </Button>
      </div>
      <DataTable
        table={table}
        className={appearance["portfolio-table"]}
        aria-label={copy.ariaLabel}
        emptyMessage={copy.empty}
        headerRowClassName={appearance["table-head"]}
        headerProps={(header) => ({
          className: "text-inherit",
          "aria-sort": sortKey === header.column.id ? (sortDirection === "asc" ? "ascending" : "descending") : "none",
        })}
        renderRow={({ original: { holding, costPerShare, returnPct, weight } }) => (
          <TableRow className={`${appearance["portfolio-row"]} border-b-0`} key={holding.symbol}>
            <TableHead className="h-auto whitespace-normal text-inherit" scope="row" data-label={copy.symbol}>
              {holding.symbol}
            </TableHead>
            <TableCell className="whitespace-normal" data-label={copy.shares}>
              {formatShares(holding.shares)}
            </TableCell>
            <TableCell className="whitespace-normal" data-label={copy.price}>
              {formatUsd(holding.price)}
            </TableCell>
            <TableCell className="whitespace-normal" data-label={copy.costBasis}>
              {formatUsd(costPerShare)}
            </TableCell>
            <TableCell className="whitespace-normal" data-label={copy.marketValue}>
              {formatUsd(holding.marketValue)}
            </TableCell>
            <TableCell
              data-label={copy.returnPct}
              className={`data-value whitespace-normal ${returnPct < 0 ? appearance["negative"] : appearance["positive"]}`}
            >
              {formatPercent(returnPct, 1)}
            </TableCell>
            <TableCell className="whitespace-normal" data-label={copy.weight}>
              {weight.toFixed(1)}%
            </TableCell>
          </TableRow>
        )}
        footer={
          <TableFooter className="border-0 bg-transparent">
            <TableRow className={`${appearance["portfolio-total-row"]} border-b-0 hover:bg-transparent`}>
              <TableHead className="h-auto whitespace-normal text-inherit" scope="row" data-label={copy.symbol}>
                {copy.total}
              </TableHead>
              <TableCell />
              <TableCell />
              <TableCell />
              <TableCell
                className={`${appearance["portfolio-total-market"]} whitespace-normal`}
                data-label={copy.marketValue}
              >
                {formatUsd(totals.marketValue)}
              </TableCell>
              <TableCell
                data-label={copy.returnPct}
                className={`whitespace-normal ${appearance["portfolio-total-return"]} data-value ${totals.totalReturn < 0 ? appearance["negative"] : appearance["positive"]}`}
              >
                {formatPercent(totals.totalReturn)}
              </TableCell>
              <TableCell />
            </TableRow>
          </TableFooter>
        }
      />
    </>
  );
}
