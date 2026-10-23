import assert from "node:assert/strict";
import { readdir } from "node:fs/promises";
import test from "node:test";

import { read } from "../../../scripts/repository-helpers.mjs";

test("CSS preserves typography roles with scoped Typeset and wordmark exceptions", async () => {
  const [tokens, globals, componentFiles] = await Promise.all([
    read("src/app/styles/tokens.css"),
    read("src/app/globals.css"),
    readdir(new URL("../../components", import.meta.url), { recursive: true }),
  ]);
  const imports = [...globals.matchAll(/@import "\.\/(.+\.css)"(?: layer\([^)]*\))?;/g)].map(
    (match) => "src/app/" + match[1],
  );
  const moduleFiles = componentFiles
    .filter((file) => file.endsWith(".module.css"))
    .map((file) => "src/components/" + file);
  const sources = await Promise.all(
    [
      ...imports.filter((path) => path !== "src/app/styles/tokens.css"),
      ...moduleFiles,
      "src/components/ui/typeset.css",
      "src/features/memos/typeset-memo.css",
    ].map(async (path) => ({
      path,
      css: (await read(path)).replace(/\/\*[\s\S]*?\*\//g, ""),
    })),
  );
  assert.deepEqual(imports, ["src/app/styles/tokens.css", "src/app/styles/base.css"]);
  assert.match(globals, /@import "\.\/styles\/base\.css" layer\(base\)/);
  const roleNames = new Set([...tokens.matchAll(/--font-size-([a-z-]+)\s*:/g)].map((match) => match[1]));
  assert.ok(roleNames.size > 0, "No typography roles found in tokens.css");

  for (const { path, css } of sources) {
    assert.doesNotMatch(css, /--font-size-[a-z-]+\s*:/, path + " redefines a typography role");
    // The vendored Typeset scale is overridden by the site-owned preset.
    // Keep its upstream relative sizes, but never allow it to redefine site roles.
    if (path === "src/components/ui/typeset.css") continue;

    const fontSizes = [...css.matchAll(/(?:^|[;{])\s*font-size\s*:\s*([^;]+);/gm)].map((match) => match[1].trim());
    if (path === "src/components/brand-logo.module.css") {
      assert.deepEqual(fontSizes, ["21px", "18px"], "Preserve the documented desktop/mobile wordmark sizes");
      continue;
    }

    const isMemoPreset = path === "src/features/memos/typeset-memo.css";
    if (isMemoPreset) {
      const sizes = [...css.matchAll(/--typeset-size\s*:\s*([^;]+);/g)].map((match) => match[1].trim());
      assert.deepEqual(sizes, ["var(--font-size-medium-body)"], "Memo body size must resolve to the site body role");
    }
    for (const value of fontSizes) {
      if (isMemoPreset && value === "var(--typeset-size)") continue;
      const role = /^var\(--font-size-([a-z-]+)\)$/.exec(value)?.[1];
      assert.ok(role && roleNames.has(role), path + " uses a non-role font size: " + value);
    }
  }
});
