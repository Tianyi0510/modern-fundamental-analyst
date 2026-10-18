import { render, screen, within } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";
import { ClientForm } from "./client-form";

it("server-rendered forms cannot submit private fields before hydration", () => {
  const container = document.createElement("div");
  container.innerHTML = renderToString(
    <ClientForm locale="en" aria-label="Private form">
      <input aria-label="Message" name="message" defaultValue="Private message" />
      <button type="submit">Send</button>
    </ClientForm>,
  );
  const form = within(container).getByRole<HTMLFormElement>("form", { name: "Private form" });
  expect(form.method).toBe("post");
  expect(within(container).getByRole("group")).toBeDisabled();
  expect(within(container).getByRole("textbox", { name: "Message" })).toBeDisabled();
  expect(within(container).getByRole("button", { name: "Send" })).toBeDisabled();
  expect([...new FormData(form).keys()]).toEqual([]);
  expect(container).toContainElement(within(container).getByText(/Your information has not been sent/));
});

it("enables the same native controls after their handler is hydrated", () => {
  const element = (
    <ClientForm locale="en">
      <input aria-label="Message" name="message" />
      <button type="submit">Send</button>
    </ClientForm>
  );
  const container = document.createElement("div");
  container.innerHTML = renderToString(element);
  document.body.append(container);
  render(element, { container, hydrate: true });
  expect(screen.getByRole("textbox", { name: "Message" })).toBeEnabled();
  expect(screen.getByRole("button", { name: "Send" })).toBeEnabled();
});
