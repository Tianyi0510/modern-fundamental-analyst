import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const snapshot = JSON.parse(readFileSync(new URL("./browser-shard-timings.json", import.meta.url), "utf8"));

for (const project of ["chromium", "webkit"]) {
  const selected = new Set(
    readFileSync(new URL(`./${project}-shard-1.txt`, import.meta.url), "utf8")
      .trim()
      .split("\n"),
  );
  const timings = snapshot.projects[project];
  for (const file of selected) assert.ok(Object.hasOwn(timings, file), `missing ${project} timing: ${file}`);

  const loads = [0, 0];
  for (const [file, duration] of Object.entries(timings)) {
    assert.ok(Number.isFinite(duration) && duration >= 0, `invalid duration: ${file}`);
    loads[selected.has(file) ? 0 : 1] += duration;
  }
  assert.ok(Math.min(...loads) > 0);
  const ratio = Math.max(...loads) / Math.min(...loads);
  console.log(`${project}: ${loads.join(" / ")} ms (ratio ${ratio.toFixed(4)})`);
  assert.ok(ratio < 1.01, `unbalanced ${project} workload in timing snapshot`);
}
