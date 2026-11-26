import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { PerformanceChartExplorer } from "./performance-chart-explorer";
import { PerformanceChartView } from "./performance-chart-view";

vi.mock("./performance-chart-explorer", () => ({ PerformanceChartExplorer: vi.fn(() => null) }));

it("renders market value in the monthly table and sends only plotted fields to the client chart", () => {
  const point = { date: "2026-10-30", portfolioReturn: 0, benchmarkReturn: null };
  render(<PerformanceChartView locale="en" measure="xirr" observations={[{ ...point, marketValue: 1234.56 }]} />);
  expect(screen.getByText("$1,234.56")).toBeInTheDocument();
  expect(vi.mocked(PerformanceChartExplorer).mock.calls[0]?.[0].observations).toStrictEqual([point]);
});
