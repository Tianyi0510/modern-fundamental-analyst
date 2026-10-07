import assert from "node:assert/strict";
import test from "node:test";
import { ESLint, Linter } from "eslint";
import path from "node:path";

const eslint = new ESLint();
const linter = new Linter();
async function restricted(file, specifier) {
  const config = await eslint.calculateConfigForFile(file);
  return linter
    .verify(`import { value } from "${specifier}";`, [
      {
        rules: { "no-restricted-imports": config.rules["no-restricted-imports"] },
      },
    ])
    .filter((message) => message.ruleId === "no-restricted-imports");
}

test("shared modules cannot import features or application composition", async () => {
  for (const file of ["src/components/site-header.tsx", "src/lib/format.ts"]) {
    for (const specifier of [
      "@/features/support/support-config",
      "../features/support/support-config",
      "@/app/_components/page-footer",
      "../app/_components/page-footer",
    ]) {
      assert.equal((await restricted(file, specifier)).length, 1, `${file}: ${specifier}`);
    }
    assert.equal((await restricted(file, "@/lib/i18n")).length, 0);
  }
});

test("features allow local and shared inputs while rejecting cross-feature imports", async () => {
  const file = "src/features/support/support-config.ts";
  for (const specifier of ["@/features/memos/memos", "../memos/memos", "@/app/api/subscribe/route"]) {
    assert.equal((await restricted(file, specifier)).length, 1, specifier);
  }
  for (const specifier of ["@/features/support/support-copy", "./support-copy", "@/lib/i18n"]) {
    assert.equal((await restricted(file, specifier)).length, 0, specifier);
  }
});

test("dynamic imports enforce resolved module boundaries without blocking local or package imports", async () => {
  async function errors(file, expression) {
    const config = await eslint.calculateConfigForFile(file);
    return linter.verify(
      `const loaded = import(${expression});`,
      [
        {
          plugins: { architecture: config.plugins.architecture },
          files: ["**/*.{ts,tsx}"],
          rules: { "architecture/dynamic-import-boundaries": "error" },
        },
      ],
      { filename: path.resolve(file) },
    );
  }
  for (const file of [
    "src/components/site-header.tsx",
    "src/lib/format.ts",
    "src/features/support/support-config.ts",
  ]) {
    for (const expression of ['"@/features/memos/memos"', '"../memos/memos"', '"@/app/api/subscribe/route"']) {
      // The relative peer path is relevant inside features, not inside shared directories.
      if (expression === '"../memos/memos"' && !file.includes("features")) continue;
      assert.equal((await errors(file, expression)).length, 1, `${file}: ${expression}`);
    }
    assert.equal((await errors(file, '"@/lib/i18n"')).length, 0);
    assert.equal((await errors(file, '"react"')).length, 0);
    assert.equal((await errors(file, '"./local-module"')).length, 0);
    assert.equal((await errors(file, '"@/lib/../features/memos/memos"')).length, 1);
    assert.equal((await errors(file, "`@/features/memos/memos`")).length, 1);
    assert.equal((await errors(file, "targetModule")).length, 1);
    assert.equal((await errors(file, "`./${moduleName}`")).length, 1);
  }
  assert.equal((await errors("src/features/support/support-config.ts", '"@/features/support/support-copy"')).length, 0);
  assert.equal((await errors("src/components/site-header.tsx", '"../features/memos/memos"')).length, 1);
  assert.equal((await errors("src/features/support/server/catalog.ts", '"../../memos/memos"')).length, 1);
  assert.equal((await errors("src/features/support/server/catalog.ts", '"../support-config"')).length, 0);
  const appConfig = await eslint.calculateConfigForFile("src/app/_components/home-page.tsx");
  assert.equal(appConfig.rules["architecture/dynamic-import-boundaries"], undefined);
});

async function isolatedMessages(file, code, ruleNames) {
  const config = await eslint.calculateConfigForFile(file);
  return linter.verify(
    code,
    [
      {
        files: ["**/*.{mjs,ts,tsx}"],
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
    ["vitest/no-focused-tests", vitestCode, "src/lib/escape-html.test.ts"],
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
  const unit = await eslint.calculateConfigForFile("src/lib/escape-html.test.ts");
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
  const { mkdtemp, writeFile, rm } = await import("node:fs/promises");
  const directory = await mkdtemp(path.resolve("src/lib/lint-cycle-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const alias = `@/lib/${path.basename(directory)}`;
  const first = path.join(directory, "first.ts");
  const second = path.join(directory, "second.ts");
  await writeFile(first, `import { second } from "${alias}/second"; export const first = () => second;`);
  await writeFile(second, 'import { first } from "./first"; export const second = () => first;');
  const config = await eslint.calculateConfigForFile(first);
  const checker = new ESLint({
    overrideConfigFile: true,
    overrideConfig: [
      {
        files: ["**/*.ts"],
        plugins: { "import-x": config.plugins["import-x"] },
        settings: config.settings,
        languageOptions: { parser: config.languageOptions.parser },
        rules: { "import-x/no-cycle": config.rules["import-x/no-cycle"] },
      },
    ],
  });
  const results = await checker.lintFiles([first, second]);
  for (const result of results) {
    assert.ok(
      result.messages.some((message) => message.ruleId === "import-x/no-cycle"),
      JSON.stringify(result.messages),
    );
  }
  const types = path.join(directory, "types.ts");
  const value = path.join(directory, "value.ts");
  await writeFile(types, `import type { Value } from "${alias}/value"; export type Types = { value: Value };`);
  await writeFile(value, 'import type { Types } from "./types"; export type Value = { types: Types };');
  for (const result of await checker.lintFiles([types, value])) {
    assert.deepEqual(result.messages, []);
  }
});
