import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { beforeEach, expect, it, vi } from "vitest";
import { server } from "../../../scripts/test-server";
import { ContactForm } from "./contact-form";

beforeEach(() => sessionStorage.clear());

async function fillMessage() {
  const user = userEvent.setup();
  await user.type(screen.getByRole("textbox", { name: "Name" }), "Reader");
  await user.type(screen.getByRole("textbox", { name: "Email" }), "reader@example.com");
  await user.type(screen.getByRole("textbox", { name: "Subject" }), "Portfolio question");
  await user.type(screen.getByRole("textbox", { name: "Message" }), "Please explain the portfolio returns.");
  return user;
}

it("submits the real form through its API client and clears fields after success", async () => {
  const requests: { body: unknown; key: string | null }[] = [];
  server.use(
    http.post("http://localhost:3210/api/contact", async ({ request }) => {
      requests.push({ body: await request.json(), key: request.headers.get("idempotency-key") });
      return HttpResponse.json({ ok: true });
    }),
  );
  render(<ContactForm locale="en" />);
  const user = await fillMessage();
  await user.click(screen.getByRole("button", { name: "Send Message" }));
  expect(await screen.findByText("Your message has been sent. Thank you for reaching out.")).toBeVisible();
  expect(requests).toHaveLength(1);
  expect(requests[0]?.body).toEqual({
    name: "Reader",
    email: "reader@example.com",
    subject: "Portfolio question",
    message: "Please explain the portfolio returns.",
    website: "",
    locale: "en",
  });
  expect(requests[0]?.key).toMatch(/^[0-9a-f-]{36}$/);
  expect(screen.getByRole("textbox", { name: "Message" })).toHaveValue("");
  expect(sessionStorage.length).toBe(0);
});

it("restores an unsent draft and failed submission identity after returning to Contact", async () => {
  const keys: (string | null)[] = [];
  server.use(
    http.post("http://localhost:3210/api/contact", ({ request }) => {
      keys.push(request.headers.get("idempotency-key"));
      return HttpResponse.json({ error: "Unavailable" }, { status: 503 });
    }),
  );
  const { unmount: leaveDraft } = render(<ContactForm locale="en" />);
  const user = await fillMessage();
  leaveDraft();
  const { unmount: leaveFailedAttempt } = render(<ContactForm locale="en" />);
  expect(screen.getByRole("textbox", { name: "Name" })).toHaveValue("Reader");
  expect(screen.getByRole("textbox", { name: "Message" })).toHaveValue("Please explain the portfolio returns.");
  await user.click(screen.getByRole("button", { name: "Send Message" }));
  expect(await screen.findByText("Your message couldn't be sent. Please try again later.")).toBeVisible();
  leaveFailedAttempt();
  render(<ContactForm locale="en" />);
  await user.click(screen.getByRole("button", { name: "Send Message" }));
  expect(await screen.findByText("Your message couldn't be sent. Please try again later.")).toBeVisible();
  expect(keys).toHaveLength(2);
  expect(keys[1]).toBe(keys[0]);
});

it("keeps drafts isolated by language and tolerates denied storage", async () => {
  const { unmount: leaveEnglish } = render(<ContactForm locale="en" />);
  await fillMessage();
  leaveEnglish();
  render(<ContactForm locale="zh-tw" />);
  expect(screen.getByRole("textbox", { name: "訊息" })).toHaveValue("");
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
    throw new Error("Storage denied");
  });
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("Storage denied");
  });
  const user = userEvent.setup();
  await user.type(screen.getByRole("textbox", { name: "訊息" }), "A new independent draft.");
  expect(screen.getByRole("textbox", { name: "訊息" })).toHaveValue("A new independent draft.");
});

it("retains input and the retry identity after failure, then creates a new identity for an edited message", async () => {
  const keys: (string | null)[] = [];
  server.use(
    http.post("http://localhost:3210/api/contact", ({ request }) => {
      keys.push(request.headers.get("idempotency-key"));
      return HttpResponse.json({ error: "Unavailable" }, { status: 503 });
    }),
  );
  render(<ContactForm locale="en" />);
  const user = await fillMessage();
  const submit = screen.getByRole("button", { name: "Send Message" });
  const error = "Your message couldn't be sent. Please try again later.";
  await user.click(submit);
  expect(await screen.findByText(error)).toBeVisible();
  expect(screen.getByRole("textbox", { name: "Message" })).toHaveValue("Please explain the portfolio returns.");
  await user.click(submit);
  expect(await screen.findByText(error)).toBeVisible();
  expect(keys).toHaveLength(2);
  expect(keys[1]).toBe(keys[0]);
  await user.type(screen.getByRole("textbox", { name: "Subject" }), " updated");
  await user.click(submit);
  expect(await screen.findByText(error)).toBeVisible();
  expect(keys).toHaveLength(3);
  expect(keys[2]).not.toBe(keys[0]);
});

it("disables editing and duplicate submission until the pending request completes", async () => {
  const response = Promise.withResolvers<void>();
  let calls = 0;
  server.use(
    http.post("http://localhost:3210/api/contact", async () => {
      calls++;
      await response.promise;
      return HttpResponse.json({ ok: true });
    }),
  );
  render(<ContactForm locale="en" />);
  const user = await fillMessage();
  try {
    await user.click(screen.getByRole("button", { name: "Send Message" }));
    const sending = await screen.findByRole("button", { name: "Sending…" });
    expect(sending).toBeDisabled();
    expect(screen.getByRole("textbox", { name: "Message" })).toBeDisabled();
    await user.click(sending);
    expect(calls).toBe(1);
  } finally {
    response.resolve();
  }
  expect(await screen.findByText("Your message has been sent. Thank you for reaching out.")).toBeVisible();
  expect(screen.getByRole("button", { name: "Send Message" })).toBeEnabled();
});

it("rejects whitespace-only names locally and focuses the described field error", async () => {
  let calls = 0;
  server.use(
    http.post("http://localhost:3210/api/contact", () => {
      calls++;
      return HttpResponse.json({ ok: true });
    }),
  );
  render(<ContactForm locale="en" />);
  const user = await fillMessage();
  const name = screen.getByRole("textbox", { name: "Name" });
  await user.clear(name);
  await user.type(name, "   ");
  await user.click(screen.getByRole("button", { name: "Send Message" }));
  expect(await screen.findByText("Enter your name.")).toBeVisible();
  expect(name).toHaveFocus();
  expect(name).toHaveAttribute("aria-invalid", "true");
  expect(name).toHaveAccessibleDescription("Enter your name.");
  expect(calls).toBe(0);
  await user.clear(name);
  await user.type(name, "Reader");
  expect(name).not.toHaveAttribute("aria-invalid", "true");
  await user.click(screen.getByRole("button", { name: "Send Message" }));
  expect(await screen.findByText("Your message has been sent. Thank you for reaching out.")).toBeVisible();
  expect(calls).toBe(1);
});

it("explains HTTP 400 as an input problem while preserving a valid draft", async () => {
  server.use(
    http.post("http://localhost:3210/api/contact", () => HttpResponse.json({ error: "Invalid" }, { status: 400 })),
  );
  render(<ContactForm locale="en" />);
  const user = await fillMessage();
  await user.click(screen.getByRole("button", { name: "Send Message" }));
  const feedback = await screen.findByText("Check the required fields, then send your message again.");
  expect(feedback).toHaveFocus();
  expect(screen.getByRole("textbox", { name: "Name" })).toHaveValue("Reader");
  expect(screen.queryByText("Your message couldn't be sent. Please try again later.")).not.toBeInTheDocument();
});
