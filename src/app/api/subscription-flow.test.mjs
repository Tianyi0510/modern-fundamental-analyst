import assert from "node:assert/strict";
import test from "node:test";
import { read } from "../../../scripts/repository-helpers.mjs";

for (const [server, client] of [
  ["contact/contact-form.tsx", "contact/contact-form-client.tsx"],
  ["subscriptions/subscribe-form.tsx", "subscriptions/subscribe-form-client.tsx"],
]) {
  test(`${server} retains the server copy and client interaction boundary`, async () => {
    const [serverSource, clientSource] = await Promise.all([
      read(`src/features/${server}`),
      read(`src/features/${client}`),
    ]);
    assert.doesNotMatch(serverSource, /^\s*["']use client["']/);
    assert.match(clientSource, /^\s*["']use client["']/);
    assert.doesNotMatch(clientSource, /process\.env\.(?:RESEND_API_KEY|SUBSCRIPTION_PREFERENCES_SECRET)/);
  });
}

test("shared footer receives subscription UI from the application layer", async () => {
  const footer = await read("src/components/site-footer.tsx");
  assert.doesNotMatch(footer, /from ["']@\/features\//);
});
