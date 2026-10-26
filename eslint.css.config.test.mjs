import assert from "node:assert/strict";
import test from "node:test";
import { ESLint } from "eslint";
import { readFileSync } from "node:fs";
import browserslist from "browserslist";
import nextBrowserslist from "next/dist/compiled/browserslist/index.js";
import { getSupportedBrowsers } from "next/dist/build/get-supported-browsers.js";

const eslint = new ESLint({ overrideConfigFile: "eslint.css.config.mjs" });
const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url)));
async function lint(code, filePath = "src/components/example.module.css") {
  const [result] = await eslint.lintText(code, { filePath });
  return result.messages;
}

test("CSS compatibility lint rejects unguarded Limited features and accepts a matching fallback guard", async () => {
  assert.ok((await lint(".example { accent-color: red; }")).some((message) => message.ruleId === "css/use-baseline"));
  assert.deepEqual(await lint("@supports (accent-color: red) { .example { accent-color: red; } }"), []);
  assert.ok(
    (await lint("@supports (display: grid) { .example { accent-color: red; } }")).some(
      (message) => message.ruleId === "css/use-baseline",
    ),
  );
  assert.deepEqual(await lint(".example { display: grid; color: black; }"), []);
});

test("Tailwind source syntax is parsed without disabling compatibility checks", async () => {
  assert.deepEqual(
    await lint(
      '@import "tailwindcss/utilities.css" layer(utilities) source("../"); @theme inline { --color-*: initial; } @custom-variant compact (@media (max-width: 800px));',
      "src/app/globals.css",
    ),
    [],
  );
  assert.ok(
    (
      await lint("@theme inline { --color-*: initial; } .example { accent-color: red; }", "src/app/styles/tokens.css")
    ).some((message) => message.ruleId === "css/use-baseline"),
  );
  assert.ok((await lint(".example { color red; }")).length > 0);
});

test("Next.js resolves the explicit Baseline policy instead of falling back to its defaults", () => {
  assert.equal(pkg.browserslist[0], "baseline widely available");
  const targets = nextBrowserslist(pkg.browserslist);
  assert.deepEqual(getSupportedBrowsers(process.cwd(), false), targets);
  assert.deepEqual(getSupportedBrowsers(process.cwd(), true), targets);
  assert.ok(targets.length > 4);
  for (const resolved of [targets, browserslist(pkg.browserslist)]) {
    for (const [browser, minimum] of [
      ["chrome", 111],
      ["edge", 111],
      ["firefox", 128],
      ["safari", 16.4],
      ["ios_saf", 16.4],
    ]) {
      const versions = resolved
        .filter((value) => value.startsWith(`${browser} `))
        .map((value) => parseFloat(value.split(" ")[1]));
      assert.ok(versions.length > 0, browser);
      assert.ok(
        versions.every((version) => version >= minimum),
        browser,
      );
    }
  }
});

test("static CI and staged CSS run the Baseline lint", () => {
  assert.match(pkg.scripts["verify:static"], /npm run lint:compatibility/);
  assert.match(pkg.scripts["lint:compatibility"], /eslint --config eslint.css.config.mjs/);
  assert.match(pkg["lint-staged"]["*.css"], /eslint --config eslint.css.config.mjs/);
});
