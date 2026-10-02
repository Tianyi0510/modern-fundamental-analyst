import { getLatestMemo } from "@/features/memos/memos.ts";
import assert from "node:assert/strict";
import test from "node:test";
import { registerHooks } from "node:module";

const values = new Map();
const redis = {
  isReady: true,
  async set(key, value, options) {
    if (options?.NX && values.has(key)) return null;
    values.set(key, value);
    return "OK";
  },
  async get(key) {
    return values.get(key) ?? null;
  },
  async del(key) {
    return Number(values.delete(key));
  },
  async eval(_script, { keys, arguments: args }) {
    if (values.get(keys[0]) !== args[0]) return 0;
    if (args.length === 2) {
      values.set(keys[0], args[1]);
      return 1;
    }
    return Number(values.delete(keys[0]));
  },
};
process.env.UPSTASH_REDIS_URL = "rediss://default:test@localhost:6379";
process.env.RESEND_API_KEY = "re_test_coordination";
process.env.SUBSCRIPTION_PREFERENCES_SECRET = "stable-test-coordination-secret";
globalThis.__mfaRedisStateV5 = { client: redis, connection: null, lastErrorLogAt: {}, unavailableUntil: 0 };
const { withSubscriberLock, getStablePreferenceEmail } = await import("./resend-coordination.ts");
const { getResendClient, resendOperationContext, reportResendRollbackFailure } = await import("@/lib/resend.ts");
registerHooks({
  resolve(specifier, context, nextResolve) {
    return nextResolve(specifier === "next/server" ? "next/server.js" : specifier, context);
  },
});
const { POST: requestPreferences } = await import("@/app/api/subscription-preferences/request/route.ts");
const { subscribeContact } = await import("./subscription-service.ts");
const { getPreferredLanguageSegmentId } = await import("./resend-segments.ts");
const { withSubscriptionJournal, readSubscriptionJournal, resolveSubscriptionJournal } =
  await import("./subscription-journal.ts");
const { POST: updatePreferences } = await import("@/app/api/subscription-preferences/route.ts");
const { updateSubscriptionPreferences } = await import("./update-subscription-preferences.ts");
const { createPreferenceToken } = await import("./subscription-preferences.ts");

function preferencesMutation(action) {
  return new Request("https://www.modernfundamentalanalyst.com/api/subscription-preferences", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      host: "www.modernfundamentalanalyst.com",
      origin: "https://www.modernfundamentalanalyst.com",
    },
    body: JSON.stringify({ action, locale: "zh-tw", token: createPreferenceToken("reader@example.com") }),
  });
}

test("confirmed preference saves clear their journal", async (t) => {
  t.mock.method(globalThis, "fetch", async (url, options) => {
    if (String(url).includes("/segments"))
      return Response.json({ data: [{ id: getPreferredLanguageSegmentId("zh-tw") }], has_more: false });
    if (options.method === "PATCH") assert.equal(JSON.parse(options.body).properties.preferred_language, "繁體中文");
    return Response.json({ id: "contact-id", unsubscribed: false });
  });
  const response = await updatePreferences(preferencesMutation("save"));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true, action: "save" });
  assert.equal(await readSubscriptionJournal("reader@example.com"), null);
});

test("confirmed preference update failures restore previous language segments and clear the journal", async (t) => {
  t.mock.method(console, "error", () => {});
  const writes = [];
  const previousId = getPreferredLanguageSegmentId("en");
  const targetId = getPreferredLanguageSegmentId("zh-tw");
  t.mock.method(globalThis, "fetch", async (url, options) => {
    if (options.method === "GET" && String(url).includes("/segments")) {
      return Response.json({ data: [{ id: previousId }], has_more: false });
    }
    if (options.method !== "GET") writes.push({ method: options.method, url: String(url) });
    if (options.method === "PATCH") {
      return Response.json(
        { name: "validation_error", message: "Mock provider rejection", statusCode: 422 },
        { status: 422 },
      );
    }
    return Response.json({ id: "contact-id", unsubscribed: false });
  });
  const email = "rollback-preferences@example.com";
  assert.deepEqual(await updateSubscriptionPreferences({ email }, "zh-tw", "save"), {
    ok: false,
    error: "Subscription preferences could not be updated.",
    status: 502,
  });
  assert.deepEqual(
    writes.map(({ method }) => method),
    ["POST", "DELETE", "PATCH", "POST", "DELETE"],
  );
  assert.ok(writes[0].url.endsWith(`/segments/${targetId}`));
  assert.ok(writes[1].url.endsWith(`/segments/${previousId}`));
  assert.ok(writes[3].url.endsWith(`/segments/${previousId}`));
  assert.ok(writes[4].url.endsWith(`/segments/${targetId}`));
  assert.equal(await readSubscriptionJournal(email), null);
});

test("ambiguous preference saves retain a journal and do not prevent later unsubscribe", async (t) => {
  t.mock.method(console, "error", () => {});
  const requests = [];
  t.mock.method(globalThis, "fetch", async (url, options) => {
    requests.push(String(url));
    if (String(url).includes("/segments"))
      return Response.json({ data: [{ id: getPreferredLanguageSegmentId("zh-tw") }], has_more: false });
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
  await withSubscriberLock("reader@example.com", () =>
    withSubscriptionJournal("reader@example.com", "en", async () => {
      await resendOperationContext.getStore().recordPhase("send-welcome-event");
      resendOperationContext.getStore().uncertain = true;
    }),
  );
  const record = await readSubscriptionJournal("reader@example.com");
  assert.equal(record.phase, "send-welcome-event");
  assert.ok(!JSON.stringify([...values]).includes("reader@example.com"));
  for (const key of values.keys()) if (key.startsWith("mfa:resend:subscriber:")) values.delete(key);
  await assert.rejects(
    withSubscriberLock("reader@example.com", () =>
      withSubscriptionJournal("reader@example.com", "en", () => assert.fail("must not retry")),
    ),
    /reconciliation/,
  );
  await assert.rejects(
    withSubscriberLock("reader@example.com", () => resolveSubscriptionJournal("reader@example.com", "wrong-id")),
    /does not match/,
  );
  await withSubscriberLock("reader@example.com", () => resolveSubscriptionJournal("reader@example.com", record.id));
  assert.equal(await readSubscriptionJournal("reader@example.com"), null);
});

test("missing dedicated secret blocks coordination and journal access", async () => {
  const secret = process.env.SUBSCRIPTION_PREFERENCES_SECRET;
  delete process.env.SUBSCRIPTION_PREFERENCES_SECRET;
  try {
    await assert.rejects(
      withSubscriberLock("reader@example.com", () => assert.fail("must not run")),
      { status: 503 },
    );
    await assert.rejects(
      getStablePreferenceEmail("request", "reader/en", "reader@example.com", () => assert.fail("must not create")),
      { status: 503 },
    );
    await assert.rejects(readSubscriptionJournal("reader@example.com"), /SUBSCRIPTION_PREFERENCES_SECRET is required/);
    assert.equal(values.size, 0);
  } finally {
    process.env.SUBSCRIPTION_PREFERENCES_SECRET = secret;
  }
});

test("rotating the Resend API key cannot hide an unresolved journal", async () => {
  const apiKey = process.env.RESEND_API_KEY;
  await withSubscriberLock("reader@example.com", () =>
    withSubscriptionJournal("reader@example.com", "en", async () => {
      resendOperationContext.getStore().uncertain = true;
    }),
  );
  const record = await readSubscriptionJournal("reader@example.com");
  const journalKeys = [...values.keys()].filter((key) => key.startsWith("mfa:subscription-journal:"));
  for (const key of values.keys()) if (key.startsWith("mfa:resend:subscriber:")) values.delete(key);
  process.env.RESEND_API_KEY = "re_rotated_coordination";
  try {
    assert.deepEqual(await readSubscriptionJournal("reader@example.com"), record);
    await assert.rejects(
      withSubscriberLock("reader@example.com", () =>
        withSubscriptionJournal("reader@example.com", "en", () => assert.fail("must not retry")),
      ),
      /reconciliation/,
    );
    assert.deepEqual(
      [...values.keys()].filter((key) => key.startsWith("mfa:subscription-journal:")),
      journalKeys,
    );
  } finally {
    process.env.RESEND_API_KEY = apiKey;
  }
});

test("subscription journal clears confirmed operations and retains interrupted ones", async () => {
  assert.equal(
    await withSubscriberLock("reader@example.com", () =>
      withSubscriptionJournal("reader@example.com", "en", async () => "ok"),
    ),
    "ok",
  );
  assert.equal(await readSubscriptionJournal("reader@example.com"), null);
  await assert.rejects(
    withSubscriberLock("reader@example.com", () =>
      withSubscriptionJournal("reader@example.com", "en", async () => {
        resendOperationContext.getStore().writeStarted = true;
        throw new Error("process interrupted");
      }),
    ),
  );
  assert.equal((await readSubscriptionJournal("reader@example.com")).phase, "starting");
});

test("a stale subscription operation cannot overwrite or delete a replacement journal", async (t) => {
  t.mock.method(console, "error", () => {});
  for (const updatePhase of [false, true]) {
    values.clear();
    await assert.rejects(
      withSubscriberLock("reader@example.com", () =>
        withSubscriptionJournal("reader@example.com", "en", async () => {
          const key = [...values.keys()].find((key) => key.startsWith("mfa:subscription-journal:"));
          values.set(key, "replacement");
          if (updatePhase) await resendOperationContext.getStore().recordPhase("create-contact");
        }),
      ),
      /ownership changed/,
    );
    assert.ok([...values.values()].includes("replacement"));
  }
});

function preferenceRequest() {
  return new Request("https://www.modernfundamentalanalyst.com/api/subscription-preferences/request", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      host: "www.modernfundamentalanalyst.com",
      origin: "https://www.modernfundamentalanalyst.com",
      "Idempotency-Key": "550e8400-e29b-41d4-a716-446655440000",
    },
    body: JSON.stringify({ email: "reader@example.com", locale: "en" }),
  });
}

test.beforeEach(() => values.clear());

function preferenceEmail(html = "secure-link") {
  return {
    from: "updates@example.com",
    to: "reader@example.com",
    subject: "Manage preferences",
    text: "Manage preferences with a secure link.",
    html,
  };
}

test("concurrent preference retries return identical randomized payloads", async () => {
  let generated = 0;
  const create = async () => {
    await Promise.resolve();
    return preferenceEmail(`random-token-${++generated}`);
  };
  const [first, second] = await Promise.all([
    getStablePreferenceEmail("request", "reader/en", "reader@example.com", create),
    getStablePreferenceEmail("request", "reader/en", "reader@example.com", create),
  ]);
  assert.deepEqual(first, second);
  assert.deepEqual(await getStablePreferenceEmail("request", "reader/en", "reader@example.com", create), first);
  assert.ok([...values.keys()].every((key) => !key.includes("reader")));
});

test("reusing a request ID with different input is rejected", async () => {
  await getStablePreferenceEmail("request", "reader/en", "reader@example.com", preferenceEmail);
  await assert.rejects(getStablePreferenceEmail("request", "reader/zh-tw", "reader@example.com", preferenceEmail), {
    status: 409,
  });
});

test("preference retries use the original payload for 25 minutes, then require a new submission ID", async () => {
  const payload = await getStablePreferenceEmail("request", "reader/en", "reader@example.com", preferenceEmail);
  const [key, value] = [...values][0];
  values.set(key, JSON.stringify({ ...JSON.parse(value), createdAt: Date.now() - 24 * 60_000 }));
  assert.deepEqual(
    await getStablePreferenceEmail("request", "reader/en", "reader@example.com", preferenceEmail),
    payload,
  );
  values.set(key, JSON.stringify({ ...JSON.parse(value), createdAt: Date.now() - 26 * 60_000 }));
  await assert.rejects(getStablePreferenceEmail("request", "reader/en", "reader@example.com", preferenceEmail), {
    status: 409,
  });
});

test("malformed preference email records fail closed without replacing the retry payload", async () => {
  await getStablePreferenceEmail("request", "reader/en", "reader@example.com", preferenceEmail);
  const [key, value] = [...values][0];
  const original = JSON.parse(value);
  for (const stored of [
    "not json",
    JSON.stringify({ ...original, payload: null }),
    JSON.stringify({ ...original, payload: { ...original.payload, to: "other@example.com" } }),
    JSON.stringify({ ...original, payload: { ...original.payload, html: null } }),
    JSON.stringify({ ...original, createdAt: Date.now() + 120_000 }),
  ]) {
    values.set(key, stored);
    await assert.rejects(
      getStablePreferenceEmail("request", "reader/en", "reader@example.com", () => assert.fail("must not create")),
      { status: 503 },
    );
    assert.equal(values.get(key), stored);
  }
});

test("a malformed cached preference email stops before provider I/O", async (context) => {
  const requestId = "preferences/550e8400-e29b-41d4-a716-446655440000";
  const email = "reader@example.com";
  await getStablePreferenceEmail(requestId, JSON.stringify({ email, locale: "en" }), email, preferenceEmail);
  const [key, value] = [...values][0];
  values.set(key, JSON.stringify({ ...JSON.parse(value), payload: null }));
  context.mock.method(globalThis, "fetch", () => assert.fail("provider must not be called"));

  assert.equal((await requestPreferences(preferenceRequest())).status, 503);
  assert.equal(globalThis.fetch.mock.callCount(), 0);
});

test("same subscriber cannot mutate concurrently; another subscriber can", async () => {
  let release;
  let entered;
  const started = new Promise((resolve) => {
    entered = resolve;
  });
  const pending = withSubscriberLock("Reader@example.com", async () => {
    entered();
    await new Promise((resolve) => {
      release = resolve;
    });
  });
  await started;
  await assert.rejects(
    withSubscriberLock("reader@example.com", async () => assert.fail("must not run")),
    { status: 503 },
  );
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

test("incomplete rollback keeps the lease and logs a reconciliation signal", async (context) => {
  const logs = context.mock.method(console, "error", () => {});
  await withSubscriberLock("reader@example.com", async () => reportResendRollbackFailure());
  assert.equal(values.size, 1);
  assert.match(logs.mock.calls[0].arguments[0], /reconciliation required/);
  await assert.rejects(
    withSubscriberLock("reader@example.com", async () => assert.fail("must not run")),
    { status: 503 },
  );
});

test("ambiguous provider outcomes retain the lease and prevent rollback calls", async (context) => {
  context.mock.method(globalThis, "fetch", async () => {
    throw new TypeError("network interrupted");
  });
  context.mock.method(console, "error", () => {});
  await withSubscriberLock("reader@example.com", async () => {
    const client = getResendClient();
    assert.ok((await client.contacts.update({ email: "reader@example.com", unsubscribed: true })).error);
    await assert.rejects(
      client.contacts.update({ email: "reader@example.com", unsubscribed: false }),
      /unknown outcome/,
    );
  });
  assert.equal(values.size, 1);
  assert.equal(globalThis.fetch.mock.callCount(), 1);
});

test("provider fetch receives an abort signal and an expired deadline prevents I/O", async (context) => {
  context.mock.method(globalThis, "fetch", async (_url, options) => {
    assert.ok(options.signal instanceof AbortSignal);
    return Response.json({ id: "email-id" });
  });
  await getResendClient().emails.send({
    from: "test@example.com",
    to: "reader@example.com",
    subject: "Test",
    text: "Test",
  });
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(
    resendOperationContext.run({ signal: controller.signal, uncertain: false }, () =>
      getResendClient().contacts.get({ email: "reader@example.com" }),
    ),
  );
  assert.equal(globalThis.fetch.mock.callCount(), 1);
});

test("Redis unavailability never falls back to an unprotected mutation", async () => {
  const original = process.env.UPSTASH_REDIS_URL;
  delete process.env.UPSTASH_REDIS_URL;
  try {
    await assert.rejects(
      withSubscriberLock("reader@example.com", async () => assert.fail("must not run")),
      { status: 503 },
    );
    await assert.rejects(
      getStablePreferenceEmail("request", "reader/en", "reader@example.com", () => assert.fail("must not run")),
      { status: 503 },
    );
  } finally {
    process.env.UPSTASH_REDIS_URL = original;
  }
});

test("preference route preserves the exact provider payload and key after a lost response", async (context) => {
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

test("unknown contacts receive the generic success response without email", async (context) => {
  context.mock.method(console, "error", () => {});
  context.mock.method(globalThis, "fetch", async () =>
    Response.json({ name: "not_found", statusCode: 404 }, { status: 404 }),
  );
  const response = await requestPreferences(preferenceRequest());
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
  assert.equal(globalThis.fetch.mock.callCount(), 1);
});

test("Resend timeout aborts the underlying fetch", async (context) => {
  const controller = new AbortController();
  context.mock.method(AbortSignal, "timeout", () => controller.signal);
  context.mock.method(console, "error", () => {});
  context.mock.method(
    globalThis,
    "fetch",
    (_url, options) =>
      new Promise((_resolve, reject) => {
        options.signal.addEventListener("abort", () => reject(options.signal.reason), { once: true });
        controller.abort(new DOMException("Timed out", "TimeoutError"));
      }),
  );
  await assert.rejects(getResendClient().contacts.get({ email: "reader@example.com" }), { name: "TimeoutError" });
});

test("active subscriptions reject repeats in every locale without provider writes", async (context) => {
  context.mock.method(globalThis, "fetch", async (_url, options) => {
    assert.equal(options.method, "GET");
    return Response.json({
      id: "contact-id",
      unsubscribed: false,
      properties: { preferred_language: { type: "string", value: "English" } },
    });
  });
  for (const locale of ["en", "zh-tw", "zh-cn"]) {
    assert.deepEqual(
      await subscribeContact("reader@example.com", locale, () =>
        assert.fail("duplicate subscription must not look up a memo"),
      ),
      {
        ok: false,
        message: "You've already subscribed",
        status: 409,
      },
    );
    assert.equal(await readSubscriptionJournal("reader@example.com"), null);
  }
  assert.equal(globalThis.fetch.mock.callCount(), 3);
});

test("a rejected welcome restores the previous language property and memberships", async (context) => {
  const english = getPreferredLanguageSegmentId("en");
  const target = getPreferredLanguageSegmentId("zh-tw");
  const memberships = new Set([english]);
  const updates = [];
  context.mock.method(console, "error", () => {});
  context.mock.method(globalThis, "fetch", async (url, options) => {
    const path = new URL(url).pathname;
    if (path.includes("/segments")) {
      if (options.method === "GET")
        return Response.json({ data: [...memberships].map((id) => ({ id })), has_more: false });
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
    return Response.json({
      id: "contact-id",
      unsubscribed: true,
      properties: { preferred_language: { type: "string", value: "English" } },
    });
  });
  assert.equal((await subscribeContact("reader@example.com", "zh-tw", getLatestMemo)).ok, false);
  assert.equal(updates.length, 2);
  assert.equal(updates[0].unsubscribed, false);
  assert.equal(updates[1].unsubscribed, true);
  assert.equal(updates[1].properties.preferred_language, "English");
  assert.equal(memberships.has(english), true);
  assert.equal(memberships.has(target), false);
});

for (const failure of ["server", "network", "deadline"]) {
  test(`read-only ${failure} failure releases its journal and permits a retry`, async (t) => {
    t.mock.method(console, "error", () => {});
    t.mock.method(globalThis, "fetch", async () => {
      if (failure === "server")
        return Response.json({ name: "application_error", message: "unavailable" }, { status: 503 });
      if (failure === "deadline") resendOperationContext.getStore().signal = AbortSignal.abort();
      throw new TypeError("read unavailable");
    });
    for (let i = 0; i < 2; i++) {
      await withSubscriberLock("read-failure@example.com", () =>
        withSubscriptionJournal("read-failure@example.com", "en", () =>
          getResendClient().contacts.get({ email: "read-failure@example.com" }),
        ),
      );
      assert.equal(await readSubscriptionJournal("read-failure@example.com"), null);
    }
    assert.equal(globalThis.fetch.mock.callCount(), 2);
  });
}
test("a thrown read-only operation clears only its owned journal", async () => {
  await assert.rejects(
    withSubscriberLock("read-throw@example.com", () =>
      withSubscriptionJournal("read-throw@example.com", "en", async () => {
        throw new Error("lookup failed");
      }),
    ),
    /lookup failed/,
  );
  assert.equal(await readSubscriptionJournal("read-throw@example.com"), null);
});

test("failed initial subscription reads can retry without looking up or sending a welcome memo", async (t) => {
  t.mock.method(console, "error", () => {});
  const fetch = t.mock.method(globalThis, "fetch", async (_url, options) => {
    assert.equal(options.method, "GET");
    return Response.json({ name: "application_error", message: "unavailable" }, { status: 503 });
  });
  for (let attempt = 0; attempt < 2; attempt++) {
    const result = await subscribeContact("initial-read@example.com", "en", () => assert.fail("must not request memo"));
    assert.equal(result.ok, false);
    assert.equal(result.status, 502);
    assert.equal(await readSubscriptionJournal("initial-read@example.com"), null);
  }
  assert.equal(fetch.mock.callCount(), 2);
});

test("a failed read after a dispatched mutation retains the journal", async (t) => {
  t.mock.method(console, "error", () => {});
  t.mock.method(globalThis, "fetch", async (_url, options) =>
    options.method === "PATCH"
      ? Response.json({ id: "contact-id" })
      : Response.json({ name: "application_error", message: "unavailable" }, { status: 503 }),
  );
  await withSubscriberLock("post-write-read@example.com", () =>
    withSubscriptionJournal("post-write-read@example.com", "en", async () => {
      const resend = getResendClient();
      await resend.contacts.update({ email: "post-write-read@example.com", unsubscribed: false });
      await resend.contacts.get({ email: "post-write-read@example.com" });
    }),
  );
  assert.ok(await readSubscriptionJournal("post-write-read@example.com"));
});

test("failed asynchronous email rendering leaves no partial retry record", async () => {
  await assert.rejects(
    getStablePreferenceEmail("render-error", "reader/en", "reader@example.com", async () => {
      await Promise.resolve();
      throw new Error("render failed");
    }),
    /render failed/,
  );
  assert.equal(values.size, 0);
  assert.deepEqual(
    await getStablePreferenceEmail("render-error", "reader/en", "reader@example.com", preferenceEmail),
    preferenceEmail(),
  );
});
