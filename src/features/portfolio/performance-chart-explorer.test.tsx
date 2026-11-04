/* eslint-disable testing-library/no-container, testing-library/no-node-access -- Recharts paths and tooltip wrappers have no semantic query targets. */
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, it, vi } from "vitest";
import { PerformanceChartExplorer } from "./performance-chart-explorer";
import type { ChartObservation } from "./performance-chart-view";

afterEach(() => vi.unstubAllGlobals());

it("renders and explores frozen observations without changing the shared monthly data", async () => {
  let enterViewport = () => {};
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback: IntersectionObserverCallback) {
        enterViewport = () =>
          callback([{ isIntersecting: true } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
      }
      observe() {}
      disconnect() {}
    },
  );
  const observations: ChartObservation[] = [
    { date: "2026-07-31", marketValue: 100, portfolioReturn: 0, benchmarkReturn: 0 },
    { date: "2026-08-31", marketValue: 105, portfolioReturn: null, benchmarkReturn: 2 },
    { date: "2026-09-30", marketValue: 110, portfolioReturn: 10, benchmarkReturn: 5 },
  ];
  const expected = structuredClone(observations);
  observations.forEach(Object.freeze);
  Object.freeze(observations);
  const props = {
    observations,
    locale: "en" as const,
    measure: "twr" as const,
    title: "Returns",
    portfolio: "Portfolio",
  };
  const { container, rerender } = render(<PerformanceChartExplorer {...props} />);
  expect(screen.getByRole("status")).toHaveTextContent("Loading interactive chart…");
  expect(screen.queryByRole("application")).not.toBeInTheDocument();

  act(enterViewport);
  const chart = await screen.findByRole("application");
  await waitFor(() => expect(container.querySelectorAll(".recharts-line-curve")).toHaveLength(2));
  const user = userEvent.setup();
  await user.tab();
  expect(chart).toHaveFocus();
  await user.keyboard("{ArrowRight}{ArrowRight}");
  await waitFor(() => {
    const tooltip = container.querySelector(".recharts-tooltip-wrapper");
    expect(tooltip).toHaveTextContent("30 Sep 2026Portfolio+10.00%SPY+5.00%");
  });

  rerender(<PerformanceChartExplorer {...props} title="Updated returns" />);
  expect(screen.getByRole("application")).toBe(chart);
  expect(container.querySelectorAll(".recharts-line-curve")).toHaveLength(2);
  expect(observations).toEqual(expected);
  expect(screen.queryByText("This chart is temporarily unavailable.")).not.toBeInTheDocument();
});
