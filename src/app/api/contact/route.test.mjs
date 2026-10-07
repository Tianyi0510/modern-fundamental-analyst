import assert from "node:assert/strict";
import test from "node:test";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { POST } from "./route.ts";

const server = setupServer();
const unexpectedRequests = [];
test.before(() =>
  server.listen({
    onUnhandledRequest(request, print) {
      unexpectedRequests.push(request.url);
      print.error();
    },
  }),
);
test.afterEach(() => {
  server.resetHandlers();
  assert.deepEqual(unexpectedRequests.splice(0), []);
});
test.after(() => server.close());

const attempt = "550e8400-e29b-41d4-a716-446655440000";

test.beforeEach((t) => {
  const previous = process.env.RESEND_API_KEY;
  process.env.RESEND_API_KEY = "re_test_contact_route";
  t.after(() => {
    if (previous === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = previous;
  });
  t.mock.method(console, "error", () => {});
});

function request(locale) {
  return new Request("https://www.modernfundamentalanalyst.com/api/contact", {
    method: "POST",
    headers: {
      host: "www.modernfundamentalanalyst.com",
      origin: "https://www.modernfundamentalanalyst.com",
      "content-type": "application/json",
      "idempotency-key": attempt.toUpperCase(),
      "x-forwarded-for": `192.0.2.${locale === "en" ? 1 : locale === "zh-tw" ? 2 : 3}`,
    },
    body: JSON.stringify({
      name: " Reader <name> ",
      email: " READER@EXAMPLE.COM ",
      subject: " Research ",
      message: " A question <tag> about the portfolio. ",
      website: "",
      locale,
    }),
  });
}

for (const locale of ["en", "zh-tw", "zh-cn"]) {
  test(`${locale} valid contact POST forwards normalized fields and retry identity to Resend`, async () => {
    const deliveries = [];
    server.use(
      http.post("https://api.resend.com/emails", async ({ request }) => {
        deliveries.push({ body: await request.text(), headers: request.headers });
        return HttpResponse.json({ id: "mock-delivery" });
      }),
    );
    const response = await POST(request(locale));
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true });
    assert.equal(deliveries.length, 1);
    const payload = JSON.parse(deliveries[0].body);
    assert.equal(payload.to, "contact@mail.modernfundamentalanalyst.com");
    assert.equal(payload.from, "Modern Fundamental Analyst <contact@mail.modernfundamentalanalyst.com>");
    assert.equal(payload.reply_to, "reader@example.com");
    assert.equal(payload.subject, "[MFA Contact] Research");
    assert.equal(
      payload.text,
      `Name: Reader <name>\nEmail: reader@example.com\nLanguage: ${locale}\nSubject: Research\n\nA question <tag> about the portfolio.`,
    );
    assert.match(payload.html, /Reader &lt;name&gt;/);
    assert.match(payload.html, /A question &lt;tag&gt; about the portfolio\./);
    assert.equal(new Headers(deliveries[0].headers).get("idempotency-key"), `contact/${attempt}`);
  });
}

test("contact POST maps provider rejection to a safe failure response", async () => {
  let calls = 0;
  server.use(
    http.post("https://api.resend.com/emails", () => {
      calls++;
      return HttpResponse.json({ name: "application_error", message: "private provider detail" }, { status: 500 });
    }),
  );
  const response = await POST(request("en"));
  assert.equal(response.status, 502);
  assert.deepEqual(await response.json(), { error: "Message could not be sent." });
  assert.equal(calls, 1);
});

test("contact POST fails without provider requests when email configuration is missing", async () => {
  delete process.env.RESEND_API_KEY;
  const response = await POST(request("en"));
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: "Email service is temporarily unavailable." });
});

test("contact POST preserves provider idempotency identity across a failed delivery and retry", async () => {
  const keys = [];
  server.use(
    http.post("https://api.resend.com/emails", ({ request }) => {
      keys.push(request.headers.get("idempotency-key"));
      return keys.length === 1
        ? HttpResponse.json({ message: "Unavailable" }, { status: 500 })
        : HttpResponse.json({ id: "mock-recovered-delivery" });
    }),
  );
  const first = await POST(request("en"));
  assert.equal(first.status, 502);
  const retry = await POST(request("en"));
  assert.equal(retry.status, 200);
  assert.deepEqual(await retry.json(), { ok: true });
  assert.deepEqual(keys, [`contact/${attempt}`, `contact/${attempt}`]);
});
