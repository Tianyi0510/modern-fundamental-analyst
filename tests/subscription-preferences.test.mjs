import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import test from "node:test";

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      return nextResolve(new URL(`../${specifier.slice(2)}.ts`, import.meta.url).href, context);
    }
    return nextResolve(specifier, context);
  },
});

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
