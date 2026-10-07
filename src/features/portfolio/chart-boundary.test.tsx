import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToString } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";
import { captureException } from "@sentry/nextjs";
import { ChartBoundary } from "./chart-boundary";
import { PerformanceChartView } from "./performance-chart-view";

vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn() }));
beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.mocked(captureException).mockClear();
});

it.each([
  ["en", "This chart is temporarily unavailable."],
  ["zh-tw", "此圖表暫時無法顯示。"],
  ["zh-cn", "此图表暂时无法显示。"],
] as const)("%s contains a real chart rendering failure without hiding siblings", (locale, message) => {
  render(
    <>
      <nav aria-label="Site navigation">Home</nav>
      <ChartBoundary locale={locale} measure="twr">
        <PerformanceChartView locale={locale} measure="twr" observations={[]} />
      </ChartBoundary>
      <section aria-label="Methodology">Methodology remains available</section>
    </>,
  );
  expect(screen.getByRole("status")).toHaveTextContent(message);
  expect(screen.getByRole("navigation")).toBeVisible();
  expect(screen.getByRole("region", { name: "Methodology" })).toBeVisible();
  expect(captureException).toHaveBeenCalledWith(expect.any(Error), {
    tags: { feature: "performance-chart", measure: "twr" },
  });
});

const renderError = new TypeError("private rendering detail");

function UnavailableChart(): never {
  throw renderError;
}

it("reports the original rendering error for SDK stack parsing", () => {
  render(
    <ChartBoundary locale="en" measure="xirr">
      <UnavailableChart />
    </ChartBoundary>,
  );
  expect(screen.getByRole("status")).toHaveTextContent("This chart is temporarily unavailable.");
  expect(captureException).toHaveBeenCalledWith(renderError, {
    tags: { feature: "performance-chart", measure: "xirr" },
  });
  expect(vi.mocked(captureException).mock.calls[0]?.[0]).toBe(renderError);
});

it("retries only the failed chart and leaves its healthy sibling mounted", async () => {
  const user = userEvent.setup();
  const content = (failed: boolean) => (
    <>
      <ChartBoundary locale="en" measure="twr">
        {failed ? <UnavailableChart /> : <p>Recovered chart</p>}
      </ChartBoundary>
      <ChartBoundary locale="en" measure="xirr">
        <input aria-label="Sibling state" defaultValue="Preserved" />
      </ChartBoundary>
    </>
  );
  const { rerender } = render(content(true));
  const sibling = screen.getByRole("textbox");
  await user.type(sibling, " locally");
  rerender(content(false));
  await user.click(screen.getByRole("button", { name: "Try Again" }));
  expect(screen.getByText("Recovered chart")).toBeVisible();
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
  expect(screen.getByRole("textbox")).toBe(sibling);
  expect(sibling).toHaveValue("Preserved locally");
});

it("keeps a local SSR fallback and surrounding content when chart rendering throws", () => {
  const html = renderToString(
    <>
      <nav>Navigation</nav>
      <ChartBoundary locale="en" measure="twr">
        <UnavailableChart />
      </ChartBoundary>
      <section>Methodology</section>
    </>,
  );
  expect(html).toContain("This chart is temporarily unavailable.");
  expect(html).toContain("<nav>Navigation</nav>");
  expect(html).toContain("<section>Methodology</section>");
});
