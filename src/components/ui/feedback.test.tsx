import { render, screen, within } from "@testing-library/react";
import { expect, it } from "vitest";
import { LineChart } from "./line-chart";
import { Button } from "./button";
import { Spinner } from "./spinner";

it("keeps the localized pending label as the button's accessible name", () => {
  render(
    <Button disabled>
      <Spinner aria-hidden="true" />
      正在傳送…
    </Button>,
  );
  const button = screen.getByRole("button", { name: "正在傳送…" });
  expect(button).toBeDisabled();
  expect(within(button).queryByRole("status")).not.toBeInTheDocument();
});

it("shows a genuine chart empty state without a loading announcement", () => {
  render(
    <LineChart
      data={[]}
      config={{}}
      series={[]}
      xKey="date"
      label="Returns"
      emptyMessage="No performance data is available."
    />,
  );
  expect(screen.getByRole("status")).toHaveTextContent("No performance data is available.");
  expect(screen.getByText("No performance data is available.")).toHaveAttribute("data-slot", "empty-description");
  expect(screen.queryByRole("application")).not.toBeInTheDocument();
});
