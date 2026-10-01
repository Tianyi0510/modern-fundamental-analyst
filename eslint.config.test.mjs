import assert from "node:assert/strict";
import test from "node:test";
import { ESLint, Linter } from "eslint";

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
