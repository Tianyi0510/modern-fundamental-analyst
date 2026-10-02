import assert from "node:assert/strict";
import test from "node:test";
import { requestPreferencesLink, subscribeToUpdates, updatePreferences } from "./subscription-api.ts";
import { PostJsonError } from "@/lib/client-post-json.ts";

test("subscription requests retain locale, bot detection, preference actions and retry identity", async (t) => {
  const calls = [];
  t.mock.method(globalThis, "fetch", async (url, options) => {
    calls.push({ url, body: JSON.parse(options.body), key: new Headers(options.headers).get("Idempotency-Key") });
    return Response.json({ ok: true });
  });
  await subscribeToUpdates({ email: "reader@example.com", website: "", locale: "zh-cn" });
  await requestPreferencesLink({ email: "reader@example.com", locale: "en" }, "same-attempt");
  await updatePreferences({ action: "save", locale: "zh-tw", token: "test-token" });
  await updatePreferences({ action: "unsubscribe", locale: "", token: "test-token" });
  assert.deepEqual(calls, [
    { url: "/api/subscribe", body: { email: "reader@example.com", website: "", locale: "zh-cn" }, key: null },
    {
      url: "/api/subscription-preferences/request",
      body: { email: "reader@example.com", locale: "en" },
      key: "same-attempt",
    },
    { url: "/api/subscription-preferences", body: { action: "save", locale: "zh-tw", token: "test-token" }, key: null },
    {
      url: "/api/subscription-preferences",
      body: { action: "unsubscribe", locale: "", token: "test-token" },
      key: null,
    },
  ]);
});

test("subscription requests preserve conflict and provider failure statuses for form recovery", async (t) => {
  let status = 409;
  t.mock.method(globalThis, "fetch", async () => new Response(null, { status }));
  await assert.rejects(
    subscribeToUpdates({ email: "reader@example.com", website: "", locale: "en" }),
    (error) => error instanceof PostJsonError && error.status === 409,
  );
  await assert.rejects(
    requestPreferencesLink({ email: "reader@example.com", locale: "en" }, "attempt"),
    (error) => error instanceof PostJsonError && error.status === 409,
  );
  status = 503;
  await assert.rejects(
    updatePreferences({ action: "unsubscribe", locale: "", token: "test-token" }),
    (error) => error instanceof PostJsonError && error.status === 503,
  );
});
