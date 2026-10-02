import assert from "node:assert/strict";
import { readdir } from "node:fs/promises";
import test from "node:test";

import { read } from "../../../scripts/repository-helpers.mjs";

test("CSS defines typography roles only in tokens.css and uses them for component sizes", async () => {
  const [tokens, globals, componentFiles] = await Promise.all([
    read("src/app/styles/tokens.css"),
    read("src/app/globals.css"),
    readdir(new URL("../../components", import.meta.url)),
  ]);
  const imports = [...globals.matchAll(/@import "\.\/(.+\.css)"(?: layer\([^)]*\))?;/g)].map(
    (match) => "src/app/" + match[1],
  );
  const moduleFiles = componentFiles
    .filter((file) => file.endsWith(".module.css"))
    .map((file) => "src/components/" + file);
  const sources = await Promise.all(
    [...imports.filter((path) => path !== "src/app/styles/tokens.css"), ...moduleFiles].map(async (path) => ({
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
    for (const [, value] of css.matchAll(/(?:^|[;{])\s*font-size\s*:\s*([^;]+);/gm)) {
      const role = /^var\(--font-size-([a-z-]+)\)$/.exec(value.trim())?.[1];
      assert.ok(role && roleNames.has(role), path + " uses a non-role font size: " + value.trim());
    }
  }
});
