import assert from "node:assert/strict";
import test from "node:test";
import { read } from "../../scripts/repository-helpers.mjs";

test("Redis uses the REST SDK without the socket dependency", async () => {
  const dependencies = JSON.parse(await read("package.json")).dependencies;
  assert.ok(dependencies["@upstash/redis"]);
  assert.equal(dependencies["@redis/client"], undefined);
});
