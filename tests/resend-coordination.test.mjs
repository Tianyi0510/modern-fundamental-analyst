import assert from "node:assert/strict";
import test from "node:test";
import { registerHooks } from "node:module";
import "./repository-helpers.mjs";

const values = new Map();
const redis = {
  isReady: true,
  async set(key, value, options) {
    if (options?.NX && values.has(key)) return null;
    values.set(key, value);
    return "OK";
  },
  async get(key) { return values.get(key) ?? null; },
  async del(key) { return Number(values.delete(key)); },
  async eval(_script, { keys, arguments: args }) {
    if (values.get(keys[0]) !== args[0]) return 0;
    if (args.length === 2) { values.set(keys[0], args[1]); return 1; }
    return Number(values.delete(keys[0]));
  },
};
process.env.UPSTASH_REDIS_URL = "rediss://default:test@localhost:6379";
process.env.RESEND_API_KEY = "re_test_coordination";
globalThis.__mfaRedisStateV5 = { client: redis, connection: null, lastErrorLogAt: {}, unavailableUntil: 0 };
const { withSubscriberLock, getStablePreferenceEmail } = await import("../lib/resend-coordination.ts");
const { getResendClient, resendOperationContext, reportResendRollbackFailure } = await import("../lib/resend.ts");
registerHooks({ resolve(specifier, context, nextResolve) {
  return nextResolve(specifier === "next/server" ? "next/server.js" : specifier, context);
} });
const { POST: requestPreferences } = await import("../app/api/subscription-preferences/request/route.ts");
const { subscribeContact } = await import("../lib/subscription-service.ts");
const { getPreferredLanguageSegmentId } = await import("../lib/resend-segments.ts");
const { withSubscriptionJournal, readSubscriptionJournal, resolveSubscriptionJournal } = await import("../lib/subscription-journal.ts");
const { POST: updatePreferences } = await import("../app/api/subscription-preferences/route.ts");
const { createPreferenceToken } = await import("../lib/subscription-preferences.ts");

function preferencesMutation(action) {
  return new Request("https://www.modernfundamentalanalyst.com/api/subscription-preferences", {
    method: "POST", headers: { "content-type": "application/json", host: "www.modernfundamentalanalyst.com", origin: "https://www.modernfundamentalanalyst.com" },
    body: JSON.stringify({ action, locale: "zh-tw", token: createPreferenceToken("reader@example.com") }),
  });
}

test("confirmed preference saves clear their journal", async t => {
  t.mock.method(globalThis, "fetch", async (url, options) => {
    if (String(url).includes("/segments")) return Response.json({ data: [{ id: getPreferredLanguageSegmentId("zh-tw") }], has_more: false });
    if (options.method === "PATCH") assert.equal(JSON.parse(options.body).properties.preferred_language, "繁體中文");
    return Response.json({ id: "contact-id", unsubscribed: false });
  });
  assert.equal((await updatePreferences(preferencesMutation("save"))).status, 200);
  assert.equal(await readSubscriptionJournal("reader@example.com"), null);
});

test("ambiguous preference saves retain a journal and do not prevent later unsubscribe", async t => {
  t.mock.method(console, "error", () => {});
  const requests = [];
  t.mock.method(globalThis, "fetch", async (url, options) => {
    requests.push(String(url));
    if (String(url).includes("/segments")) return Response.json({ data: [{ id: getPreferredLanguageSegmentId("zh-tw") }], has_more: false });
    if (options.method === "PATCH" && !JSON.parse(options.body).unsubscribed) throw new TypeError("response lost");
    return Response.json({ id: "contact-id", unsubscribed: false });
  });
  assert.equal((await updatePreferences(preferencesMutation("save"))).status, 502);
  const record = await readSubscriptionJournal("reader@example.com");
  assert.equal(record.operation, "preferences");
  assert.equal(record.phase, "rollback-language-segments");
  for (const key of values.keys()) if (key.startsWith("mfa:resend:subscriber:")) values.delete(key);
  const previousCount = requests.length;
  assert.equal((await updatePreferences(preferencesMutation("save"))).status, 503);
  assert.equal(requests.length, previousCount);
  assert.equal((await updatePreferences(preferencesMutation("unsubscribe"))).status, 200);
  assert.equal((await readSubscriptionJournal("reader@example.com")).id, record.id);
});

test("subscription journal persists uncertain phases and blocks blind retries after lease expiry", async () => {
  await withSubscriberLock("reader@example.com", () => withSubscriptionJournal("reader@example.com", "en", async () => {
    await resendOperationContext.getStore().recordPhase("send-welcome-event");
    resendOperationContext.getStore().uncertain = true;
  }));
  const record = await readSubscriptionJournal("reader@example.com");
  assert.equal(record.phase, "send-welcome-event");
  assert.ok(!JSON.stringify([...values]).includes("reader@example.com"));
  for (const key of values.keys()) if (key.startsWith("mfa:resend:subscriber:")) values.delete(key);
  await assert.rejects(withSubscriberLock("reader@example.com", () => withSubscriptionJournal("reader@example.com", "en", () => assert.fail("must not retry"))), /reconciliation/);
  await assert.rejects(withSubscriberLock("reader@example.com", () => resolveSubscriptionJournal("reader@example.com", "wrong-id")), /does not match/);
  await withSubscriberLock("reader@example.com", () => resolveSubscriptionJournal("reader@example.com", record.id));
  assert.equal(await readSubscriptionJournal("reader@example.com"), null);
});

test("subscription journal clears confirmed operations and retains interrupted ones", async () => {
  assert.equal(await withSubscriberLock("reader@example.com", () => withSubscriptionJournal("reader@example.com", "en", async () => "ok")), "ok");
  assert.equal(await readSubscriptionJournal("reader@example.com"), null);
  await assert.rejects(withSubscriberLock("reader@example.com", () => withSubscriptionJournal("reader@example.com", "en", async () => { throw new Error("process interrupted"); })));
  assert.equal((await readSubscriptionJournal("reader@example.com")).phase, "starting");
});

test("a stale subscription operation cannot overwrite or delete a replacement journal", async t => {
  t.mock.method(console, "error", () => {});
  for (const updatePhase of [false, true]) {
    values.clear();
    await assert.rejects(withSubscriberLock("reader@example.com", () => withSubscriptionJournal("reader@example.com", "en", async () => {
      const key = [...values.keys()].find(key => key.startsWith("mfa:subscription-journal:"));
      values.set(key, "replacement");
      if (updatePhase) await resendOperationContext.getStore().recordPhase("create-contact");
    })), /ownership changed/);
    assert.ok([...values.values()].includes("replacement"));
  }
});

function preferenceRequest() {
  return new Request("https://www.modernfundamentalanalyst.com/api/subscription-preferences/request", {
    method: "POST",
    headers: { "Content-Type": "application/json", host: "www.modernfundamentalanalyst.com", origin: "https://www.modernfundamentalanalyst.com", "Idempotency-Key": "550e8400-e29b-41d4-a716-446655440000" },
    body: JSON.stringify({ email: "reader@example.com", locale: "en" }),
  });
}

test.beforeEach(() => values.clear());

test("concurrent preference retries return identical randomized payloads", async () => {
  let generated = 0;
  const create = () => ({ html: `random-token-${++generated}`, to: "reader@example.com" });
  const [first, second] = await Promise.all([
    getStablePreferenceEmail("request", "reader/en", create),
    getStablePreferenceEmail("request", "reader/en", create),
  ]);
  assert.deepEqual(first, second);
  assert.deepEqual(await getStablePreferenceEmail("request", "reader/en", create), first);
  assert.ok([...values.keys()].every(key => !key.includes("reader")));
});

test("reusing a request ID with different input is rejected", async () => {
  await getStablePreferenceEmail("request", "reader/en", () => ({}));
  await assert.rejects(getStablePreferenceEmail("request", "reader/zh-tw", () => ({})), { status: 409 });
});

test("expired preference links require a new submission ID", async () => {
  await getStablePreferenceEmail("request", "reader/en", () => ({}));
  const [key, value] = [...values][0];
  values.set(key, JSON.stringify({ ...JSON.parse(value), createdAt: Date.now() - 26 * 60_000 }));
  await assert.rejects(getStablePreferenceEmail("request", "reader/en", () => ({})), { status: 409 });
});

test("same subscriber cannot mutate concurrently; another subscriber can", async () => {
  let release;
  let entered;
  const started = new Promise(resolve => { entered = resolve; });
  const pending = withSubscriberLock("Reader@example.com", async () => {
    entered();
    await new Promise(resolve => { release = resolve; });
  });
  await started;
  await assert.rejects(withSubscriberLock("reader@example.com", async () => assert.fail("must not run")), { status: 503 });
  assert.equal(await withSubscriberLock("other@example.com", async () => "ok"), "ok");
  release();
  await pending;
  assert.equal(await withSubscriberLock("reader@example.com", async () => "retry"), "retry");
});

test("release does not delete a replacement lease", async () => {
  await withSubscriberLock("reader@example.com", async () => {
    const [key] = values.keys();
    values.set(key, "another-owner");
  });
  assert.deepEqual([...values.values()], ["another-owner"]);
});

test("incomplete rollback keeps the lease and logs a reconciliation signal", async context => {
  const logs = context.mock.method(console, "error", () => {});
  await withSubscriberLock("reader@example.com", async () => reportResendRollbackFailure());
  assert.equal(values.size, 1);
  assert.match(logs.mock.calls[0].arguments[0], /reconciliation required/);
  await assert.rejects(withSubscriberLock("reader@example.com", async () => assert.fail("must not run")), { status: 503 });
});

test("ambiguous provider outcomes retain the lease and prevent rollback calls", async context => {
  context.mock.method(globalThis, "fetch", async () => { throw new TypeError("network interrupted"); });
  context.mock.method(console, "error", () => {});
  await withSubscriberLock("reader@example.com", async () => {
    const client = getResendClient();
    assert.ok((await client.contacts.update({ email: "reader@example.com", unsubscribed: true })).error);
    await assert.rejects(client.contacts.update({ email: "reader@example.com", unsubscribed: false }), /unknown outcome/);
  });
  assert.equal(values.size, 1);
  assert.equal(globalThis.fetch.mock.callCount(), 1);
});

test("provider fetch receives an abort signal and an expired deadline prevents I/O", async context => {
  context.mock.method(globalThis, "fetch", async (_url, options) => {
    assert.ok(options.signal instanceof AbortSignal);
    return Response.json({ id: "email-id" });
  });
  await getResendClient().emails.send({ from: "test@example.com", to: "reader@example.com", subject: "Test", text: "Test" });
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(resendOperationContext.run({ signal: controller.signal, uncertain: false }, () => getResendClient().contacts.get({ email: "reader@example.com" })));
  assert.equal(globalThis.fetch.mock.callCount(), 1);
});

test("Redis unavailability never falls back to an unprotected mutation", async () => {
  const original = process.env.UPSTASH_REDIS_URL;
  delete process.env.UPSTASH_REDIS_URL;
  try {
    await assert.rejects(withSubscriberLock("reader@example.com", async () => assert.fail("must not run")), { status: 503 });
    await assert.rejects(getStablePreferenceEmail("request", "reader/en", () => assert.fail("must not run")), { status: 503 });
  } finally {
    process.env.UPSTASH_REDIS_URL = original;
  }
});

test("preference route preserves the exact provider payload and key after a lost response", async context => {
  const sends = [];
  context.mock.method(console, "error", () => {});
  context.mock.method(globalThis, "fetch", async (url, options) => {
    if (String(url).includes("/contacts/")) return Response.json({ id: "contact-id" });
    sends.push({ body: options.body, key: options.headers.get("Idempotency-Key") });
    if (sends.length === 1) throw new TypeError("response lost");
    return Response.json({ id: "email-id" });
  });
  assert.equal((await requestPreferences(preferenceRequest())).status, 503);
  assert.equal((await requestPreferences(preferenceRequest())).status, 200);
  assert.equal(sends.length, 2);
  assert.deepEqual(sends[0], sends[1]);
});

test("unknown contacts receive the generic success response without email", async context => {
  context.mock.method(console, "error", () => {});
  context.mock.method(globalThis, "fetch", async () => Response.json({ name: "not_found", statusCode: 404 }, { status: 404 }));
  const response = await requestPreferences(preferenceRequest());
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
  assert.equal(globalThis.fetch.mock.callCount(), 1);
});

test("Resend timeout aborts the underlying fetch", async context => {
  const controller = new AbortController();
  context.mock.method(AbortSignal, "timeout", () => controller.signal);
  context.mock.method(console, "error", () => {});
  context.mock.method(globalThis, "fetch", (_url, options) => new Promise((_resolve, reject) => {
    options.signal.addEventListener("abort", () => reject(options.signal.reason), { once: true });
    controller.abort(new DOMException("Timed out", "TimeoutError"));
  }));
  await assert.rejects(getResendClient().contacts.get({ email: "reader@example.com" }), { name: "TimeoutError" });
});

test("an unchanged active subscription reads membership without writing or sending welcome", async context => {
  context.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(options.method, "GET");
    return Response.json(String(url).includes("/segments")
      ? { data: [{ id: getPreferredLanguageSegmentId("en") }], has_more: false }
      : { id: "contact-id", unsubscribed: false, properties: { preferred_language: { type: "string", value: "English" } } });
  });
  assert.deepEqual(await subscribeContact("reader@example.com", "en"), { ok: true });
  assert.equal(globalThis.fetch.mock.callCount(), 2);
});

test("a rejected welcome restores the previous language property and memberships", async context => {
  const english = getPreferredLanguageSegmentId("en");
  const target = getPreferredLanguageSegmentId("zh-tw");
  const memberships = new Set([english]);
  const updates = [];
  context.mock.method(console, "error", () => {});
  context.mock.method(globalThis, "fetch", async (url, options) => {
    const path = new URL(url).pathname;
    if (path.includes("/segments")) {
      if (options.method === "GET") return Response.json({ data: [...memberships].map(id => ({ id })), has_more: false });
      const id = path.split("/").at(-1);
      if (options.method === "POST") memberships.add(id);
      if (options.method === "DELETE") memberships.delete(id);
      return Response.json({ id });
    }
    if (path.includes("/events")) return Response.json({ name: "validation_error", statusCode: 422 }, { status: 422 });
    if (options.method === "PATCH") {
      updates.push(JSON.parse(options.body));
      return Response.json({ id: "contact-id" });
    }
    return Response.json({ id: "contact-id", unsubscribed: true, properties: { preferred_language: { type: "string", value: "English" } } });
  });
  assert.equal((await subscribeContact("reader@example.com", "zh-tw")).ok, false);
  assert.equal(updates.length, 2);
  assert.equal(updates[0].unsubscribed, false);
  assert.equal(updates[1].unsubscribed, true);
  assert.equal(updates[1].properties.preferred_language, "English");
  assert.equal(memberships.has(english), true);
  assert.equal(memberships.has(target), false);
});
