import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, it } from "vitest";
import { AnimatedDisclosure } from "./animated-disclosure";

it("Collapsible exposes its state and restores focus when content closes", async () => {
  render(
    <AnimatedDisclosure summary="Show Details">
      <a href="/about">About</a>
    </AnimatedDisclosure>,
  );
  const trigger = screen.getByRole("button", { name: "Show Details" });
  expect(trigger).toHaveAttribute("aria-expanded", "false");
  expect(screen.queryByRole("link", { name: "About" })).not.toBeInTheDocument();
  fireEvent.click(trigger);
  expect(trigger).toHaveAttribute("aria-expanded", "true");
  screen.getByRole("link", { name: "About" }).focus();
  fireEvent.click(trigger);
  expect(trigger).toHaveAttribute("aria-expanded", "false");
  expect(trigger).toHaveFocus();
  await waitFor(() => expect(screen.queryByRole("link", { name: "About" })).not.toBeInTheDocument());
});
