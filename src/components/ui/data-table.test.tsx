import { render, screen, within } from "@testing-library/react";
import { createColumnHelper, tableFeatures, useTable } from "@tanstack/react-table";
import { expect, it } from "vitest";
import { DataTable } from "./data-table";

const features = tableFeatures({});
const helper = createColumnHelper<typeof features, { symbol: string; value: number }>();
const columns = helper.columns([
  helper.accessor("symbol", { header: "Stock" }),
  helper.accessor("value", { header: "Value" }),
]);
function Holdings({ data }: { data: Array<{ symbol: string; value: number }> }) {
  const table = useTable({ features, columns, data });
  return <DataTable table={table} emptyMessage="No holdings" aria-label="Holdings" />;
}

it("renders native column headings and updates to the supplied data", () => {
  const { rerender } = render(<Holdings data={[{ symbol: "MSFT", value: 42 }]} />);
  const table = screen.getByRole("table", { name: "Holdings" });
  expect(within(table).getByRole("columnheader", { name: "Stock" })).toHaveAttribute("scope", "col");
  expect(within(table).getByRole("cell", { name: "MSFT" })).toBeVisible();
  rerender(<Holdings data={[{ symbol: "SPY", value: 12 }]} />);
  expect(within(table).getByRole("cell", { name: "SPY" })).toBeVisible();
  expect(within(table).queryByRole("cell", { name: "MSFT" })).not.toBeInTheDocument();
});

it("renders the caller's localized empty state", () => {
  render(<Holdings data={[]} />);
  expect(screen.getByRole("cell", { name: "No holdings" })).toHaveAttribute("colspan", "2");
  expect(screen.getByText("No holdings")).toHaveAttribute("data-slot", "empty-description");
});
