import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { AnimatedDisclosure } from "./animated-disclosure";

afterEach(() => vi.unstubAllGlobals());

it("reduced motion toggles without measuring an unused animation height", () => {
  vi.stubGlobal("matchMedia", () => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  render(
    <AnimatedDisclosure summary="Show Details">
      <a href="/about">About</a>
    </AnimatedDisclosure>,
  );
  const summary = screen.getByText("Show Details");
  const details = screen.getByRole<HTMLDetailsElement>("group");
  const measure = vi.spyOn(details, "getBoundingClientRect");
  fireEvent.click(summary);
  expect(details.open).toBe(true);
  expect(summary).toHaveAttribute("aria-expanded", "true");
  screen.getByRole("link", { name: "About" }).focus();
  fireEvent.click(summary);
  expect(details.open).toBe(false);
  expect(summary).toHaveAttribute("aria-expanded", "false");
  expect(summary).toHaveFocus();
  expect(measure).not.toHaveBeenCalled();
});
