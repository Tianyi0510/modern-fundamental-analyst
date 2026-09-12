import assert from "node:assert/strict";
import test from "node:test";

const { createPreferenceToken, readPreferenceToken } = await import("../lib/subscription-preferences.ts");

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

test("saved language comes from the contact and unavailable values remain unknown", async context => {
  const oldKey = process.env.RESEND_API_KEY;
  process.env.RESEND_API_KEY = 're_test_preferences';
  const { getSavedPreferenceLocale } = await import('../lib/subscription-preferences.ts');
  try {
    let property;
    context.mock.method(globalThis, 'fetch', async () => Response.json({ id: 'contact', properties: { preferred_language: { value: property } } }));
    for (const [value, expected] of [['English', 'en'], ['繁體中文', 'zh-tw'], ['简体中文', 'zh-cn'], ['zh-tw', 'zh-tw'], ['unknown', null], [undefined, null]]) {
      property = value;
      assert.equal(await getSavedPreferenceLocale('reader@example.com'), expected);
    }
    context.mock.method(globalThis, 'fetch', async () => { throw new TypeError('offline'); });
    assert.equal(await getSavedPreferenceLocale('reader@example.com'), null);
  } finally {
    if (oldKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = oldKey;
  }
});
