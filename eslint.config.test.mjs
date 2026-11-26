import assert from "node:assert/strict";
import test from "node:test";
import { ESLint, Linter } from "eslint";
import path from "node:path";
import { tmpdir } from "node:os";

const eslint = new ESLint();
const linter = new Linter();
const boundaryRule = "architecture/import-boundaries";

test("imports and re-exports respect resolved layer and feature ownership", async () => {
  const cases = [
    ["src/lib/format.ts", "../features/support/support-config", "boundary"],
    ["src/lib/format.ts", "../app/_components/page-footer", "boundary"],
    ["src/components/site-header/site-header.tsx", "../../features/memos/memos", "boundary"],
    ["src/components/site-header/site-header.tsx", "@/lib/i18n", null],
    ["src/features/new-domain/service.js", "../support/support-config", "boundary"],
    ["src/features/support/support-config.ts", "@/features/new-domain/catalog", "boundary"],
    ["src/features/new-domain/service.js", "@/features/new-domain/catalog", null],
    ["src/features/new-domain/service.js", "@/app/api/contact/route", "boundary"],
    ["src/features/support/server/catalog.ts", "../support-config", null],
    ["src/features/support/server/catalog.ts", "../../memos/memos", "boundary"],
    ["src/features/support/support-config.ts", "@/lib/../features/memos/memos", "boundary"],
    ["src/features/subscriptions/server/subscription-journal-cli.mjs", "./subscription-journal.ts", null],
    ["src/features/subscriptions/server/subscription-journal-cli.mjs", "@/features/support/support-config", "boundary"],
    ["src/features/subscriptions/server/subscription-journal-cli.mjs", "node:path", null],
    ["src/app/_components/home-page.tsx", "@/features/support/support-config", null],
    ["src/lib/example.test.mjs", "@/features/support/support-config", null],
  ];
  for (const [file, specifier, expected] of cases) {
    const source = JSON.stringify(specifier);
    for (const code of [
      `import ${source};`,
      `export { value } from ${source};`,
      `export * from ${source};`,
      `import(${source});`,
    ]) {
      const messages = await isolatedMessages(file, code, [boundaryRule]);
      assert.deepEqual(
        messages.map((message) => message.messageId),
        expected ? [expected] : [],
        `${file}: ${code}`,
      );
    }
  }
});

test("inline TypeScript import types respect the same layer boundaries", async () => {
  for (const [file, specifier, expected] of [
    ["src/lib/format.ts", "@/features/contact/contact-validation", "boundary"],
    ["src/features/support/support-config.ts", "../contact/contact-validation", "boundary"],
    ["src/features/contact/contact-form.tsx", "./contact-validation", null],
    ["src/lib/format.ts", "@/lib/i18n", null],
  ]) {
    const code = `type T = typeof import(${JSON.stringify(specifier)});`;
    const messages = await isolatedMessages(file, code, [boundaryRule]);
    assert.deepEqual(
      messages.map((message) => message.messageId),
      expected ? [expected] : [],
      `${file}: ${code}`,
    );
  }
});

test("local exports and literal dynamic imports retain their semantics", async () => {
  for (const [code, expected] of [
    ["const value = 1; export { value };", null],
    ["import type { Value } from '@/features/memos/memos';", "boundary"],
    ["type Field = import('@/features/contact/contact-validation').ContactField;", "boundary"],
    ["type Language = import('./i18n').Locale;", null],
    ["export type { Value } from '@/features/memos/memos';", "boundary"],
    ["import(`@/features/memos/memos`);", "boundary"],
    ["import('react');", null],
    ["import(targetModule);", "literal"],
    ["import(`./${moduleName}`);", "literal"],
  ]) {
    const messages = await isolatedMessages("src/lib/format.ts", code, [boundaryRule]);
    assert.deepEqual(
      messages.map((message) => message.messageId),
      expected ? [expected] : [],
      code,
    );
  }
});

async function isolatedMessages(file, code, ruleNames) {
  const config = await eslint.calculateConfigForFile(file);
  return linter.verify(
    code,
    [
      {
        files: ["**/*.{js,mjs,ts,tsx}"],
        languageOptions: { parser: config.languageOptions.parser },
        plugins: config.plugins,
        settings: config.settings,
        rules: Object.fromEntries(
          ruleNames.filter((name) => config.rules[name]).map((name) => [name, config.rules[name]]),
        ),
      },
    ],
    { filename: path.resolve(file) },
  );
}

test("test rules report misuse only in their intended runners", async () => {
  const vitestCode = 'import { it, expect } from "vitest"; it.only("works", () => { expect(true).toBe(true); });';
  const playwrightCode =
    'import { test, expect } from "@playwright/test"; test("works", async ({ page }) => { expect(page.getByRole("button")).toBeVisible(); });';
  const domCode =
    'import { expect } from "vitest"; import { screen } from "@testing-library/react"; expect(screen.getByRole("button").disabled).toBe(true);';
  const cases = [
    ["vitest/no-focused-tests", vitestCode, "src/lib/sentry-replay.test.ts"],
    ["playwright/missing-playwright-await", playwrightCode, "src/app/security-headers.spec.ts"],
    ["jest-dom/prefer-enabled-disabled", domCode, "src/features/contact/contact-form.integration.test.tsx"],
    [
      "testing-library/await-async-queries",
      'import { screen } from "@testing-library/react"; screen.findByRole("button");',
      "src/features/portfolio/chart-boundary.test.tsx",
    ],
  ];
  for (const [rule, code, file] of cases) {
    assert.ok(
      (await isolatedMessages(file, code, [rule])).some((message) => message.ruleId === rule),
      rule,
    );
    for (const other of ["src/lib/format.ts", "src/app/api/contact/route.test.mjs", "eslint.config.test.mjs"]) {
      assert.equal((await isolatedMessages(other, code, [rule])).length, 0, `${rule}: ${other}`);
    }
  }
  const browser = await eslint.calculateConfigForFile("src/app/security-headers.spec.ts");
  assert.equal(browser.rules["vitest/valid-expect"], undefined);
  assert.equal(browser.rules["jest-dom/prefer-enabled-disabled"], undefined);
  const unit = await eslint.calculateConfigForFile("src/lib/sentry-replay.test.ts");
  assert.equal(unit.rules["testing-library/await-async-queries"], undefined);
  assert.equal(unit.rules["playwright/missing-playwright-await"], undefined);
});

test("source naming allows Next.js conventions and rejects mixed-case source paths", async () => {
  const rules = ["check-file/filename-naming-convention", "check-file/folder-naming-convention"];
  for (const file of [
    "src/features/contact/contact-form.integration.test.tsx",
    "src/app/(en)/memos/[memoId]/page.tsx",
    "src/app/[...slug]/route.ts",
    "src/app/[[...slug]]/page.tsx",
    "src/app/@modal/default.tsx",
    "src/app/_components/global-error.tsx",
    "src/app/(.)photo/[id]/page.tsx",
    "src/app/(..)photo/page.tsx",
    "src/app/(..)(..)photo/page.tsx",
    "src/app/(...)photo/page.tsx",
    "src/app/.well-known/route.ts",
  ]) {
    assert.deepEqual(await isolatedMessages(file, "export {};", rules), [], file);
  }
  for (const [file, rule] of [
    ["src/components/ContactForm.tsx", rules[0]],
    ["src/features/ContactForms/contact-form.tsx", rules[1]],
    ["src/app/ContactPage/page.tsx", rules[1]],
    ["src/components/_private/widget.tsx", rules[1]],
  ]) {
    assert.ok(
      (await isolatedMessages(file, "export {};", rules)).some((message) => message.ruleId === rule),
      file,
    );
  }
});

test("cycle detection resolves TypeScript aliases and ignores type-only edges", async (t) => {
  const { copyFile, mkdir, mkdtemp, realpath, rm, symlink, writeFile } = await import("node:fs/promises");
  const project = await mkdtemp(path.join(await realpath(tmpdir()), "lint-cycle-"));
  t.after(() => rm(project, { recursive: true, force: true }));
  // Load the real lint and alias configuration against an isolated source tree.
  for (const file of ["eslint.config.mjs", "tsconfig.json"]) {
    await copyFile(path.join(import.meta.dirname, file), path.join(project, file));
  }
  await symlink(path.join(import.meta.dirname, "node_modules"), path.join(project, "node_modules"), "junction");
  const directory = path.join(project, "src", "lib");
  await mkdir(directory, { recursive: true });
  const first = path.join(directory, "first.ts");
  const second = path.join(directory, "second.ts");
  await writeFile(first, 'import { second } from "@/lib/second"; export const first = () => second;');
  await writeFile(second, 'import { first } from "./first"; export const second = () => first;');
  const checker = new ESLint({ cwd: project, ruleFilter: ({ ruleId }) => ruleId === "import-x/no-cycle" });
  const results = await checker.lintFiles([first, second]);
  for (const result of results) {
    assert.ok(
      result.messages.some((message) => message.ruleId === "import-x/no-cycle"),
      JSON.stringify(result.messages),
    );
  }
  const types = path.join(directory, "types.ts");
  const value = path.join(directory, "value.ts");
  await writeFile(types, 'import type { Value } from "@/lib/value"; export type Types = { value: Value };');
  await writeFile(value, 'import type { Types } from "./types"; export type Value = { types: Types };');
  for (const result of await checker.lintFiles([types, value])) {
    assert.deepEqual(result.messages, []);
  }
});

test("browser API compatibility lint follows project targets and excludes server and test code", async () => {
  const config = await eslint.calculateConfigForFile("src/components/site-header/site-header.tsx");
  const rules = { "compat/compat": config.rules["compat/compat"] };
  const run = (source) => linter.verify(source, [{ plugins: { compat: config.plugins.compat }, rules }]);
  assert.ok(run("navigator.bluetooth.requestDevice({});").some((message) => message.ruleId === "compat/compat"));
  assert.deepEqual(run('fetch("/api/status");'), []);
  assert.deepEqual(run('if ("bluetooth" in navigator) { navigator.bluetooth.requestDevice({}); }'), []);
  for (const file of [
    "src/app/api/contact/route.ts",
    "src/features/contact/server/contact-service.ts",
    "src/components/theme.spec.ts",
  ]) {
    assert.equal((await eslint.calculateConfigForFile(file)).rules["compat/compat"], undefined, file);
  }
});
