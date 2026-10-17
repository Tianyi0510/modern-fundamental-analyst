import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { TouchPressFeedback } from "./touch-press-feedback";

function control() {
  render(
    <>
      <TouchPressFeedback />
      <button data-touch-feedback>Example Action</button>
    </>,
  );
  const button = screen.getByRole("button", { name: "Example Action" });
  fireEvent.pointerDown(button, { pointerType: "touch", pointerId: 1, isPrimary: true, clientX: 50, clientY: 50 });
  expect(button).toHaveAttribute("data-touch-pressed", "true");
  return button;
}

it("cancels a scrolling gesture without querying layout", () => {
  const button = control();
  const measure = vi.spyOn(button, "getBoundingClientRect");
  fireEvent.pointerMove(button, { pointerType: "touch", pointerId: 1, clientX: 80, clientY: 50 });
  expect(button).not.toHaveAttribute("data-touch-pressed");
  expect(measure).not.toHaveBeenCalled();
});

it("uses current bounds for small movements and cancels when the control moves away", () => {
  const button = control();
  const measure = vi.spyOn(button, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 0, 100, 100));
  fireEvent.pointerMove(button, { pointerType: "touch", pointerId: 1, clientX: 55, clientY: 50 });
  expect(button).toHaveAttribute("data-touch-pressed", "true");
  expect(measure).toHaveBeenCalledOnce();
  measure.mockReturnValue(new DOMRect(60, 0, 100, 100));
  fireEvent.pointerMove(button, { pointerType: "touch", pointerId: 1, clientX: 56, clientY: 50 });
  expect(button).not.toHaveAttribute("data-touch-pressed");
});
