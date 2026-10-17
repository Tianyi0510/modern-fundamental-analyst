import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { expect, it } from "vitest";
import { server } from "../../../scripts/test-server";
import { SubscribeForm } from "./subscribe-form";
import { SubscriptionPreferencesRequestForm } from "./subscription-preferences-request-form";

const cases = [
  { name: "Footer subscription", form: <SubscribeForm locale="en" />, endpoint: "/api/subscribe" },
  { name: "Contact subscription", form: <SubscribeForm locale="en" variant="standard" />, endpoint: "/api/subscribe" },
  {
    name: "preference link",
    form: (
      <SubscriptionPreferencesRequestForm
        locale="en"
        copy={{
          email: "Email Address",
          invalidEmail: "Enter a valid email address.",
          request: "Send Secure Link",
          requesting: "Sending…",
          sent: "If this address is subscribed, check your inbox for a secure link to manage your preferences.",
          error: "Your request couldn't be completed. Please try again.",
        }}
      />
    ),
    endpoint: "/api/subscription-preferences/request",
  },
];

for (const { name, form, endpoint } of cases) {
  it(`${name} rejects an incomplete domain locally and focuses its described error`, async () => {
    let calls = 0;
    server.use(
      http.post(`http://localhost:3210${endpoint}`, () => {
        calls++;
        return HttpResponse.json({ ok: true });
      }),
    );
    render(form);
    const user = userEvent.setup();
    const email = screen.getByRole("textbox", { name: "Email Address" });
    await user.type(email, "reader@example");
    await user.click(screen.getByRole("button"));
    expect(await screen.findByText("Enter a valid email address.")).toBeVisible();
    expect(email).toHaveFocus();
    expect(email).toHaveAttribute("aria-invalid", "true");
    expect(email).toHaveAccessibleDescription("Enter a valid email address.");
    expect(calls).toBe(0);
    await user.type(email, ".com");
    expect(email).not.toHaveAttribute("aria-invalid", "true");
    await user.click(screen.getByRole("button"));
    expect(await screen.findByRole("status")).not.toBeEmptyDOMElement();
    expect(email).toHaveValue("");
    expect(calls).toBe(1);
  });

  it(`${name} distinguishes HTTP 400 and preserves the attempt for an unchanged retry`, async () => {
    const keys: (string | null)[] = [];
    server.use(
      http.post(`http://localhost:3210${endpoint}`, ({ request }) => {
        keys.push(request.headers.get("idempotency-key"));
        return keys.length === 1
          ? HttpResponse.json({ error: "Invalid input" }, { status: 400 })
          : HttpResponse.json({ ok: true });
      }),
    );
    render(form);
    const user = userEvent.setup();
    const email = screen.getByRole("textbox", { name: "Email Address" });
    await user.type(email, "reader@example.com");
    await user.click(screen.getByRole("button"));
    expect(await screen.findByText("Enter a valid email address.")).toBeVisible();
    expect(email).toHaveFocus();
    expect(email).toHaveValue("reader@example.com");
    await user.click(screen.getByRole("button"));
    expect(await screen.findByRole("status")).not.toBeEmptyDOMElement();
    expect(email).toHaveValue("");
    expect(keys).toHaveLength(2);
    expect(keys[0]).toBeTruthy();
    expect(keys[1]).toBe(keys[0]);
  });
}
