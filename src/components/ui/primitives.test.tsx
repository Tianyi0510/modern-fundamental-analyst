import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from "./alert-dialog";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "./collapsible";
import { RadioGroup, RadioGroupItem } from "./radio-group";
import { ToggleGroup, ToggleGroupItem } from "./toggle-group";
import { Toaster, toast } from "./toast";

it("opens an alert dialog with a name and returns focus after cancellation", async () => {
  const user = userEvent.setup();
  render(
    <AlertDialog>
      <AlertDialogTrigger>Review change</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>Confirm change</AlertDialogTitle>
        <AlertDialogDescription>Check the pending change.</AlertDialogDescription>
        <AlertDialogCancel>Keep settings</AlertDialogCancel>
      </AlertDialogContent>
    </AlertDialog>,
  );
  const trigger = screen.getByRole("button", { name: "Review change" });
  await user.click(trigger);
  expect(await screen.findByRole("alertdialog", { name: "Confirm change" })).toBeVisible();
  await user.click(screen.getByRole("button", { name: "Keep settings" }));
  expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
});

it("keeps collapsible content synchronized with the native trigger", async () => {
  const user = userEvent.setup();
  render(
    <Collapsible>
      <CollapsibleTrigger>Monthly data</CollapsibleTrigger>
      <CollapsibleContent>August observations</CollapsibleContent>
    </Collapsible>,
  );
  const trigger = screen.getByRole("button", { name: "Monthly data" });
  expect(trigger).toHaveAttribute("aria-expanded", "false");
  await user.click(trigger);
  expect(trigger).toHaveAttribute("aria-expanded", "true");
  expect(screen.getByText("August observations")).toBeVisible();
  await user.click(trigger);
  expect(trigger).toHaveAttribute("aria-expanded", "false");
});

it("supports keyboard selection in the radio group", async () => {
  const user = userEvent.setup();
  render(
    <RadioGroup aria-label="Support amount" defaultValue="six">
      <RadioGroupItem value="six" aria-label="Six dollars" />
      <RadioGroupItem value="twelve" aria-label="Twelve dollars" />
    </RadioGroup>,
  );
  screen.getByRole("radio", { name: "Six dollars" }).focus();
  await user.keyboard("{ArrowRight}");
  expect(screen.getByRole("radio", { name: "Twelve dollars" })).toBeChecked();
});

it("exposes toggle group selection through aria-pressed", async () => {
  const user = userEvent.setup();
  render(
    <ToggleGroup aria-label="Series">
      <ToggleGroupItem value="portfolio">Portfolio</ToggleGroupItem>
      <ToggleGroupItem value="benchmark">SPY</ToggleGroupItem>
    </ToggleGroup>,
  );
  const benchmark = screen.getByRole("button", { name: "SPY" });
  await user.click(benchmark);
  expect(benchmark).toHaveAttribute("aria-pressed", "true");
});

it("renders and dismisses a managed toast", async () => {
  const user = userEvent.setup();
  render(
    <Toaster>
      <button
        type="button"
        onClick={() => toast.add({ title: "Saved", description: "Your settings are saved.", timeout: 0 })}
      >
        Save
      </button>
    </Toaster>,
  );
  await user.click(screen.getByRole("button", { name: "Save" }));
  expect(await screen.findByText("Your settings are saved.")).toBeVisible();
  await user.keyboard("{F6}");
  await user.click(screen.getByRole("button", { name: "Close toast" }));
  expect(screen.queryByText("Your settings are saved.")).not.toBeInTheDocument();
});
