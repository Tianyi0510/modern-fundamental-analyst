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
