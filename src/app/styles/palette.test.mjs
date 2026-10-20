import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";
import { colorContrast } from "../../../scripts/color-contrast.ts";

const root = new URL("../../../", import.meta.url);
const palette = new Set([
  "#0d288b",
  "#3d8af7",
  "#7dcbfa",
  "#000000",
  "#ffffff",
  "#cccccc",
  "#eef0f2",
  "#f5f7fa",
  "#007c66",
  "#bf2a2c",
]);

// Exceptions: dark surface hierarchy and readable dark financial/status feedback only.
const functionalPalette = new Set(["#292929", "#1f1f1f", "#333333", "#3d3d3d", "#eeacb2", "#9fd89f"]);

test("website and vector assets only declare approved primitive or Fluent functional colors", async () => {
  for (const path of [
    "src/app/styles/tokens.css",
    "src/app/icon.svg",
    "public/icon.svg",
    "public/logo.svg",
    "public/logo-wordmark.svg",
    "public/logo-wordmark-inverse.svg",
  ]) {
    const source = await readFile(new URL(path, root), "utf8");
    assert.doesNotMatch(source, /color-mix\(/);
    for (const color of source.match(/#[0-9a-f]{6}\b/gi) ?? [])
      assert.ok(
        palette.has(color.toLowerCase()) || (path.endsWith("tokens.css") && functionalPalette.has(color.toLowerCase())),
        `${path}: ${color}`,
      );
  }
  assert.equal(
    await readFile(new URL("src/app/icon.svg", root), "utf8"),
    await readFile(new URL("public/icon.svg", root), "utf8"),
  );
});

test("contrast checks support unrounded sRGB mixes and alpha compositing", () => {
  assert.equal(colorContrast("color(srgb 1 1 1)", "color(srgb 0 0 0)"), 21);
  assert.equal(
    colorContrast("color(srgb 0 0 0 / 0.5)", "rgb(255, 255, 255)"),
    colorContrast("rgba(0, 0, 0, 0.5)", "rgb(255, 255, 255)"),
  );
  assert.ok(colorContrast("color(srgb 0.55 0.7688235294 0.73)", "color(srgb 0.16 0.16 0.16)") >= 4.5);
});

test("primitive inventory is unique and explicit/system dark functional mappings agree", async () => {
  const source = await readFile(new URL("src/app/styles/tokens.css", root), "utf8");
  const declarations = [...source.matchAll(/(--[\w-]+):\s*(#[0-9a-f]{6});/gi)];
  const primitives = declarations.filter(([, , value]) => palette.has(value.toLowerCase()));
  assert.equal(primitives.length, 10);
  assert.equal(new Set(primitives.map(([, , value]) => value)).size, 10);
  assert.doesNotMatch(source, /--market-neutral:|--(?:black|white)-alpha-\d+:|--color-chart-\d+:/);
  assert.match(source, /--color-\*: initial;/);
  const allowedAlpha = {
    "--colorBackgroundOverlay": [0.4, 0.5],
    "--colorNeutralShadowAmbient": [0.12, 0.24],
    "--colorNeutralShadowKey": [0.14, 0.28],
  };
  for (const [, token, value] of source.matchAll(/(--[\w-]+): (rgba?\([^;]+\));/g)) {
    const allowedValues = allowedAlpha[token]?.map((alpha) => `rgba(0, 0, 0, ${alpha})`);
    assert.ok(allowedValues?.includes(value), `${token}: non-default alpha`);
  }
  const explicit = source.match(/:root\[data-theme="dark"\] \{([^}]+)\}/)[1];
  const system = source.match(/:root:not\(\[data-theme\]\) \{([^}]+)\}/)[1];
  assert.equal(explicit.replace(/\s+/g, ""), system.replace(/\s+/g, ""));
});

test("website components cannot introduce raw color values or default Tailwind palettes", async () => {
  const independentRenderers = new Set(["components/email-layout.tsx", "features/contact/contact-email.tsx"]);
  for (const file of await readdir(new URL("src/", root), { recursive: true })) {
    if (!/\.(css|tsx?|mjs)$/.test(file) || /\.(?:spec|test)\./.test(file) || file === "app/styles/tokens.css") continue;
    let source = await readFile(new URL(`src/${file}`, root), "utf8");
    // Recharts default-attribute selectors match library output; they do not assign colors.
    source = source.replace(/\[stroke='#(?:ccc|fff)'\]/g, "");
    assert.doesNotMatch(source, /color-mix\(/);
    assert.doesNotMatch(
      source,
      /(?:bg|text|border|ring|stroke|fill)-(?:muted|foreground|border|ring|destructive)\/\d+/,
    );
    const literals = source.match(/#[0-9a-f]{3,8}\b|(?:rgba?|hsla?|oklch|oklab)\([\d.]/gi) ?? [];
    for (const color of literals) {
      assert.ok(independentRenderers.has(file) && palette.has(color.toLowerCase()), `${file}: ${color}`);
    }
    assert.doesNotMatch(
      source,
      /(?:text|bg|border|fill|stroke|ring|outline|from|to|via)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d+/,
    );
  }
});

// The inventory describes current consumers rather than unused registry defaults.
test("unused shadcn color aliases are absent from tokens and the documented inventory", async () => {
  for (const path of ["src/app/styles/tokens.css", "docs/DESIGN_SYSTEM.md"]) {
    const source = await readFile(new URL(path, root), "utf8");
    assert.doesNotMatch(source, /--color-(?:secondary(?:-foreground)?|accent-foreground)\b/);
  }
});
