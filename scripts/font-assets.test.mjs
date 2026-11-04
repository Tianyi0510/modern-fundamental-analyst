import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

const directory = new URL("../src/app/zh-cn/fonts/", import.meta.url);
const manifest = JSON.parse(await readFile(new URL("manifest.json", directory), "utf8"));
const stylesheet = await readFile(new URL("noto-sans-sc.css", directory), "utf8");
const coreJson = await readFile(new URL("core-codepoints.json", directory), "utf8");
const sha256 = (data) => createHash("sha256").update(data).digest("hex");

function points(specification) {
  const result = new Set();
  for (const part of specification.replaceAll(" ", "").split(",")) {
    const [start, stop = start] = part.slice(2).split("-");
    const first = Number.parseInt(start.replaceAll("?", "0"), 16);
    const last = Number.parseInt(stop.replaceAll("?", "f"), 16);
    for (let point = first; point <= last; point++) result.add(point);
  }
  return result;
}

const faces = new Map(
  [...stylesheet.matchAll(/@font-face\s*\{([^}]+)\}/g)]
    .filter((match) => match[1].includes("unicode-range"))
    .map((match) => {
      const body = match[1];
      assert.match(body, /font-weight:\s*100 900;/);
      assert.match(body, /font-display:\s*swap;/);
      return [body.match(/url\("\.\/([^"]+)"\)/)[1], points(body.match(/unicode-range:\s*([^;]+);/)[1])];
    }),
);

test("all 101 complete source fonts and 13 extra Han fonts match their recorded hashes", async () => {
  assert.equal(manifest.sources.length, 101);
  assert.equal(manifest.sources.filter((entry) => entry.coreFile).length, 13);
  const expected = new Set();
  for (const entry of manifest.sources) {
    assert.match(entry.sourceUrl, /^https:\/\/fonts\.gstatic\.com\/s\/notosanssc\/v41\//);
    const source = await readFile(new URL(entry.file, directory));
    assert.equal(sha256(source), entry.sourceSha256, `${entry.file} must remain byte-identical`);
    assert.equal(source.byteLength, entry.sourceBytes);
    assert.ok(entry.glyphCount > 0 && entry.cmapCount > 0);
    expected.add(entry.file);
    if (entry.coreFile) {
      const core = await readFile(new URL(entry.coreFile, directory));
      assert.equal(sha256(core), entry.coreSha256);
      assert.equal(core.byteLength, entry.coreBytes);
      expected.add(entry.coreFile);
    }
  }
  assert.deepEqual(new Set((await readdir(directory)).filter((file) => file.endsWith(".woff2"))), expected);
  assert.equal(faces.size, 114);
  assert.equal(sha256(await readFile(new URL("OFL.txt", directory))), manifest.licenseSha256);
});

test("CSS partitions preserve every original codepoint without overlap and keep variation bases in original fonts", () => {
  const assignedCore = new Set();
  for (const entry of manifest.sources) {
    const original = points(entry.unicodeRange);
    const remainder = faces.get(entry.file);
    const core = entry.coreFile ? faces.get(entry.coreFile) : new Set();
    assert.deepEqual(core, new Set(entry.coreCodepoints ?? []));
    assert.deepEqual(new Set([...remainder, ...core]), original);
    assert.equal([...core].filter((point) => remainder.has(point)).length, 0);
    for (const point of core) {
      assert.ok(!assignedCore.has(point));
      assert.ok((point >= 0x3400 && point <= 0x9fff) || (point >= 0x20000 && point <= 0x3134f));
      assignedCore.add(point);
    }
    for (const sequence of entry.variationSequences) assert.ok(!core.has(sequence.base));
  }
  const declaredCore = new Set(JSON.parse(coreJson));
  assert.equal(
    sha256(
      [...declaredCore]
        .sort((a, b) => a - b)
        .map((point) => point.toString(16).toUpperCase())
        .join(","),
    ),
    manifest.coreSelectionSha256,
    "The core selection must be reviewed before changing its pinned digest",
  );
  assert.deepEqual(assignedCore, declaredCore);
  assert.equal(assignedCore.size, 190);
  const rare = manifest.sources.find((entry) => points(entry.unicodeRange).has(0x9f98));
  assert.ok(faces.get(rare.file).has(0x9f98), "A rare Han character still selects the complete original font");
});

test("the localized font keeps the original fallback metrics and family variable", () => {
  assert.match(stylesheet, /ascent-override:\s*110\.73%;/);
  assert.match(stylesheet, /descent-override:\s*27\.49%;/);
  assert.match(stylesheet, /size-adjust:\s*104\.76%;/);
  assert.match(stylesheet, /--font-noto-sans-sc:\s*"Noto Sans SC", "Noto Sans SC Fallback";/);
});
