import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import test from "node:test";

function headersFor(environment) {
  const output = execFileSync(
    process.execPath,
    [
      "--import",
      "./scripts/register-server.mjs",
      "--input-type=module",
      "-e",
      'import config from "./next.config.ts"; console.log(JSON.stringify(await config.headers()));',
    ],
    {
      cwd: import.meta.dirname,
      env: { ...process.env, NODE_ENV: environment, SENTRY_AUTH_TOKEN: "" },
      encoding: "utf8",
    },
  );
  const routes = JSON.parse(output);
  assert.equal(routes[0].source, "/:path*");
  return routes[0].headers.find((header) => header.key === "Content-Security-Policy").value;
}

test("production CSP limits script origins without disabling static hydration, Replay or Checkout", () => {
  const policy = headersFor("production");
  const directives = Object.fromEntries(
    policy.split("; ").map((part) => {
      const [name, ...values] = part.split(" ");
      return [name, values];
    }),
  );
  assert.deepEqual(directives["script-src"], [
    "'self'",
    "'unsafe-inline'",
    "https://va.vercel-scripts.com",
    "https://vercel.live",
  ]);
  assert.deepEqual(directives["script-src-attr"], ["'none'"]);
  assert.deepEqual(directives["object-src"], ["'none'"]);
  assert.deepEqual(directives["worker-src"], ["'self'", "blob:"]);
  assert.deepEqual(directives["form-action"], ["'self'", "https://checkout.stripe.com"]);
  assert.deepEqual(directives["upgrade-insecure-requests"], []);
});

test("development CSP permits React debugging without forcing localhost onto HTTPS", () => {
  const policy = headersFor("development");
  assert.ok(policy.includes("'unsafe-eval'"));
  assert.ok(!policy.includes("upgrade-insecure-requests"));
});
