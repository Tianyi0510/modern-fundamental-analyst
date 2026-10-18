import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import { SupportAmountChoices } from "./support-amount-choices";

const choices = [
  { value: "support-6-v1", amount: 6 },
  { value: "support-12-v1", amount: 12 },
  { value: "support-18-v1", amount: 18 },
];
it("selects amounts with card clicks and keyboard and submits exactly one product", async () => {
  const user = userEvent.setup();
  render(
    <form aria-label="Support">
      <SupportAmountChoices choices={choices} initialChoice="support-12-v1" disabled={false} label="Amount" />
    </form>,
  );
  expect(screen.getByRole("radiogroup", { name: "Amount" })).toBeVisible();
  expect(screen.getByRole("radio", { name: "USD 12" })).toBeChecked();
  await user.click(screen.getByText("$6"));
  expect(screen.getByRole("radio", { name: "USD 6" })).toBeChecked();
  await user.keyboard("{ArrowRight}");
  expect(screen.getByRole("radio", { name: "USD 12" })).toBeChecked();
  expect(new FormData(screen.getByRole<HTMLFormElement>("form")).getAll("product_id")).toEqual(["support-12-v1"]);
});
it("keeps recovery choices disabled", () => {
  render(<SupportAmountChoices choices={choices} initialChoice="support-18-v1" disabled label="Amount" />);
  for (const radio of screen.getAllByRole("radio")) expect(radio).toHaveAttribute("aria-disabled", "true");
  expect(screen.getByRole("radio", { name: "USD 18" })).toBeChecked();
});
