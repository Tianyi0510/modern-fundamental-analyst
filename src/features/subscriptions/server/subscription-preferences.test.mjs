import { HttpResponse } from "msw";
import { interceptResendRequests } from "../../../../scripts/resend-test-server.mjs";
import assert from "node:assert/strict";
import test from "node:test";
import { createCipheriv, createHash, randomBytes } from "node:crypto";

const { createPreferenceToken, readPreferenceToken } = await import("./subscription-preferences.ts");

test("preference tokens expire at their deadline", (t) => {
  const previous = process.env.SUBSCRIPTION_PREFERENCES_SECRET;
  process.env.SUBSCRIPTION_PREFERENCES_SECRET = "test-only-expiry-secret";
  t.after(() => {
    if (previous === undefined) delete process.env.SUBSCRIPTION_PREFERENCES_SECRET;
    else process.env.SUBSCRIPTION_PREFERENCES_SECRET = previous;
  });
  let now = 1_000;
  t.mock.method(Date, "now", () => now);
  const token = createPreferenceToken("reader@example.com", 100);
  now = 1_099;
  assert.equal(readPreferenceToken(token)?.email, "reader@example.com");
  now = 1_100;
  assert.equal(readPreferenceToken(token), null);
});

test("preference tokens survive migration from the Resend-derived key", () => {
  const previousResendKey = process.env.RESEND_API_KEY;
  const previousPreferenceSecret = process.env.SUBSCRIPTION_PREFERENCES_SECRET;

  try {
    process.env.RESEND_API_KEY = "legacy-resend-key";
    delete process.env.SUBSCRIPTION_PREFERENCES_SECRET;
    const legacyToken = createPreferenceToken("reader@example.com");

    process.env.SUBSCRIPTION_PREFERENCES_SECRET = "dedicated-preference-secret";
    assert.equal(readPreferenceToken(legacyToken)?.email, "reader@example.com");

    const dedicatedToken = createPreferenceToken("subscriber@example.com");
    process.env.RESEND_API_KEY = "rotated-resend-key";
    assert.equal(readPreferenceToken(dedicatedToken)?.email, "subscriber@example.com");
  } finally {
    if (previousResendKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = previousResendKey;
    if (previousPreferenceSecret === undefined) delete process.env.SUBSCRIPTION_PREFERENCES_SECRET;
    else process.env.SUBSCRIPTION_PREFERENCES_SECRET = previousPreferenceSecret;
  }
});

test("preference tokens reject tampering", () => {
  const previousSecret = process.env.SUBSCRIPTION_PREFERENCES_SECRET;

  try {
    process.env.SUBSCRIPTION_PREFERENCES_SECRET = "dedicated-preference-secret";
    const token = createPreferenceToken("reader@example.com");
    const replacement = token.endsWith("A") ? "B" : "A";
    assert.equal(readPreferenceToken(`${token.slice(0, -1)}${replacement}`), null);
  } finally {
    if (previousSecret === undefined) delete process.env.SUBSCRIPTION_PREFERENCES_SECRET;
    else process.env.SUBSCRIPTION_PREFERENCES_SECRET = previousSecret;
  }
});

test("saved language comes from the contact and unavailable values remain unknown", async () => {
  const oldKey = process.env.RESEND_API_KEY;
  process.env.RESEND_API_KEY = "re_test_preferences";
  const { getSavedPreferenceLocale } = await import("./subscription-preferences.ts");
  try {
    let property;
    interceptResendRequests(["GET /contacts/:contact"], async () =>
      Response.json({ id: "contact", properties: { preferred_language: { value: property } } }),
    );
    for (const [value, expected] of [
      ["English", "en"],
      ["繁體中文", "zh-tw"],
      ["简体中文", "zh-cn"],
      ["zh-tw", "zh-tw"],
      ["unknown", null],
      [undefined, null],
    ]) {
      property = value;
      assert.equal(await getSavedPreferenceLocale("reader@example.com"), expected);
    }
    interceptResendRequests(["GET /contacts/:contact"], async () => {
      return HttpResponse.error();
    });
    assert.equal(await getSavedPreferenceLocale("reader@example.com"), null);
  } finally {
    if (oldKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = oldKey;
  }
});

function encryptPayload(json, secret) {
  const iv = randomBytes(12);
  const key = createHash("sha256").update(`subscription-preferences:${secret}`).digest();
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(json, "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString("base64url");
}

for (const source of ["primary", "legacy"]) {
  test(`preference tokens validate authenticated payloads from the ${source} key`, (t) => {
    const previousSecret = process.env.SUBSCRIPTION_PREFERENCES_SECRET;
    const previousResend = process.env.RESEND_API_KEY;
    process.env.SUBSCRIPTION_PREFERENCES_SECRET = "test-payload-primary";
    process.env.RESEND_API_KEY = "test-payload-legacy";
    t.after(() => {
      if (previousSecret === undefined) delete process.env.SUBSCRIPTION_PREFERENCES_SECRET;
      else process.env.SUBSCRIPTION_PREFERENCES_SECRET = previousSecret;
      if (previousResend === undefined) delete process.env.RESEND_API_KEY;
      else process.env.RESEND_API_KEY = previousResend;
    });
    t.mock.method(Date, "now", () => 1_000);
    const secret = source === "primary" ? "test-payload-primary" : "test-payload-legacy";
    const valid = { version: 1, email: "reader@example.com", expiresAt: 2_000 };
    assert.deepEqual(readPreferenceToken(encryptPayload(JSON.stringify(valid), secret)), valid);
    const invalid = [
      null,
      [],
      "payload",
      1,
      { version: 1, email: valid.email },
      ...[null, "not-a-date", "2000", {}, [], true, 1_000, 999].map((expiresAt) => ({ ...valid, expiresAt })),
      ...[undefined, null, 1, "", "not-an-email"].map((email) => ({ ...valid, email })),
      ...[undefined, "1", 2].map((version) => ({ ...valid, version })),
    ];
    for (const payload of invalid) {
      const json = JSON.stringify(payload);
      assert.equal(readPreferenceToken(encryptPayload(json, secret)), null, json);
    }
    // JSON permits this exponent, but JavaScript parses it as Infinity.
    const overflow = '{"version":1,"email":"reader@example.com","expiresAt":1e400}';
    assert.equal(readPreferenceToken(encryptPayload(overflow, secret)), null);
    assert.equal(readPreferenceToken(encryptPayload("invalid JSON", secret)), null);
  });
}
