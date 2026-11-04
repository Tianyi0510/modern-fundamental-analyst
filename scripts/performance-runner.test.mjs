import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

async function runFixture(t, { scenario = "", flags = "", cleanupFailure = false, signal, interruptAt } = {}) {
  const child = spawn(process.execPath, [fileURLToPath(new URL("./performance-runner-fixture.mjs", import.meta.url))], {
    stdio: ["ignore", "pipe", "pipe"],
    env: {
      ...process.env,
      LIGHTHOUSE_CHROME_FLAGS: flags,
      PERFORMANCE_TEST_SCENARIO: scenario,
      PERFORMANCE_TEST_CLEANUP_FAILURE: cleanupFailure ? "1" : "",
    },
  });
  t.after(() => {
    if (child.exitCode === null && child.signalCode === null) child.kill("SIGKILL");
  });
  let output = "";
  let interrupted = false;
  child.stdout.on("data", (data) => {
    output += data;
    if (signal && !interrupted && output.includes(interruptAt)) {
      interrupted = true;
      child.kill(signal);
    }
  });
  child.stderr.on("data", (data) => {
    output += data;
  });
  const result = await new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("close", (code, exitSignal) => resolve({ code, exitSignal }));
  });
  return { result, output };
}

for (const cleanupFailure of [false, true]) {
  for (const [signal, expectedCode] of [
    ["SIGINT", 130],
    ["SIGTERM", 143],
  ]) {
    test(
      `${signal} during calibration stops before audits (cleanup failure: ${cleanupFailure})`,
      { timeout: 10000 },
      async (t) => {
        const { result, output } = await runFixture(t, { cleanupFailure, signal, interruptAt: "CALIBRATION STARTED" });
        assert.deepEqual(result, { code: expectedCode, exitSignal: null }, output);
        assert.match(output, /SERVER CLEANUP SIGTERM/);
        assert.match(output, /CHROME CLEANUP/);
        assert.match(output, /BROWSER CLEANUP/);
        assert.doesNotMatch(output, /AUDIT SPAWNED|Performance budgets passed/);
      },
    );
  }
}

for (const [label, flags, expected] of [
  ["default", "", ["--headless=new"]],
  ["CI", "--headless=new --no-sandbox", ["--headless=new", "--no-sandbox"]],
  ["quoted value", "--headless=new --user-agent='Audit Agent'", ["--headless=new", "--user-agent=Audit Agent"]],
  ["wrapped expression", "'--headless=new --no-sandbox'", ["--headless=new", "--no-sandbox"]],
]) {
  test(`calibration and all audits use matching ${label} flags`, { timeout: 10000 }, async (t) => {
    const { result, output } = await runFixture(t, { scenario: "success", flags });
    assert.deepEqual(result, { code: 0, exitSignal: null }, output);
    for (const prefix of ["CALIBRATION FLAGS", "SAVED CALIBRATION FLAGS", "AUDIT FLAGS"]) {
      const values = [...output.matchAll(new RegExp(`^${prefix} (.+)$`, "gm"))];
      assert.equal(values.length, prefix === "AUDIT FLAGS" ? 12 : 1, output);
      for (const match of values) assert.deepEqual(JSON.parse(match[1]), expected, output);
    }
    assert.equal((output.match(/AUDIT SPAWNED/g) ?? []).length, 12, output);
    assert.match(output, /SUMMARY ROUTES 4/);
    assert.match(output, /Performance budgets passed/);
    assert.match(output, /SERVER CLEANUP SIGTERM/);
    assert.match(output, /AUDIT TIMEOUT {"timeout":120000,"killSignal":"SIGINT"}/);
  });
}

test("an audit failure stops sampling and preserves its failure when cleanup fails", { timeout: 10000 }, async (t) => {
  const { result, output } = await runFixture(t, { scenario: "audit-failure", cleanupFailure: true });
  assert.deepEqual(result, { code: 1, exitSignal: null }, output);
  assert.match(output, /Lighthouse failed \(7\)/);
  assert.match(output, /Mock server cleanup failed/);
  assert.match(output, /SERVER CLEANUP SIGTERM/);
  assert.equal((output.match(/AUDIT SPAWNED/g) ?? []).length, 1, output);
  assert.doesNotMatch(output, /SUMMARY ROUTES|Performance budgets passed/);
});

for (const [signal, expectedCode] of [
  ["SIGINT", 130],
  ["SIGTERM", 143],
]) {
  test(
    `${signal} during an active audit requests Lighthouse cleanup and stops sampling`,
    { timeout: 10000 },
    async (t) => {
      const { result, output } = await runFixture(t, {
        scenario: "audit-cancel",
        signal,
        interruptAt: "AUDIT SPAWNED",
      });
      assert.deepEqual(result, { code: expectedCode, exitSignal: null }, output);
      assert.match(output, /AUDIT CLEANUP SIGINT/);
      assert.match(output, /SERVER CLEANUP SIGTERM/);
      assert.equal((output.match(/AUDIT SPAWNED/g) ?? []).length, 1, output);
      assert.doesNotMatch(output, /SUMMARY ROUTES|Performance budgets passed/);
    },
  );
}
