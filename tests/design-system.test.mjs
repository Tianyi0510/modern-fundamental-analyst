import assert from "node:assert/strict";
import { readdir } from "node:fs/promises";
import test from "node:test";

import { read } from "./repository-helpers.mjs";

test("CSS defines typography roles only in base.css and uses them for component sizes", async () => {
  const [base, globals, componentFiles] = await Promise.all([
    read("app/styles/base.css"),
    read("app/globals.css"),
    readdir(new URL("../components/", import.meta.url)),
  ]);
  const imports = [...globals.matchAll(/@import "\.\/(.+\.css)";/g)].map((match) => "app/" + match[1]);
  const moduleFiles = componentFiles.filter((file) => file.endsWith(".module.css")).map((file) => "components/" + file);
  const sources = await Promise.all(
    [...imports.filter((path) => path !== "app/styles/base.css"), ...moduleFiles].map(async (path) => ({
      path,
      css: (await read(path)).replace(/\/\*[\s\S]*?\*\//g, ""),
    })),
  );
  const roleNames = new Set([...base.matchAll(/--font-size-([a-z-]+)\s*:/g)].map((match) => match[1]));
  assert.ok(roleNames.size > 0, "No typography roles found in base.css");

  for (const { path, css } of sources) {
    assert.doesNotMatch(css, /--font-size-[a-z-]+\s*:/, path + " redefines a typography role");
    for (const [, value] of css.matchAll(/(?:^|[;{])\s*font-size\s*:\s*([^;]+);/gm)) {
      const role = /^var\(--font-size-([a-z-]+)\)$/.exec(value.trim())?.[1];
      assert.ok(role && roleNames.has(role), path + " uses a non-role font size: " + value.trim());
    }
    if (path === "app/styles/responsive.css") {
      assert.doesNotMatch(css, /(?:^|[;{])\s*font-size\s*:/gm, "Responsive rules must not switch typography roles");
    }
  }
});
