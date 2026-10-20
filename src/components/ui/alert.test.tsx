import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { Alert, AlertDescription, AlertAction } from "./alert";

it("keeps concise status messages polite and keyboard focusable", () => {
  render(<Alert tabIndex={-1}>Saved.</Alert>);
  const status = screen.getByRole("status");
  expect(status).toHaveTextContent("Saved.");
  expect(status).toHaveAttribute("aria-live", "polite");
  status.focus();
  expect(status).toHaveFocus();
});

it("composes a named recovery message with an operable action", async () => {
  const retry = vi.fn();
  render(
    <Alert role="alert" aria-label="Unable to save" aria-describedby="details">
      <AlertDescription id="details">Your draft is preserved.</AlertDescription>
      <AlertAction>
        <button onClick={retry}>Retry</button>
      </AlertAction>
    </Alert>,
  );
  const alert = screen.getByRole("alert", { name: "Unable to save" });
  expect(alert).toHaveAttribute("aria-live", "assertive");
  expect(alert).toHaveAccessibleDescription("Your draft is preserved.");
  const user = userEvent.setup();
  await user.tab();
  expect(screen.getByRole("button", { name: "Retry" })).toHaveFocus();
  await user.keyboard("{Enter}");
  expect(retry).toHaveBeenCalledOnce();
});
