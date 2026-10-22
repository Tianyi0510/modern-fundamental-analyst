import assert from "node:assert/strict";
import test from "node:test";
import { createServer } from "node:http";
import { setupServer } from "msw/node";
import { rejectUnhandledNetwork } from "./unhandled-network.ts";

test("MSW rejects and records unhandled traffic before it reaches a real server", async (t) => {
  let received = 0;
  const origin = createServer((_request, response) => {
    received++;
    response.end("This request must never reach the server");
  });
  await new Promise((resolve) => origin.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise((resolve) => origin.close(resolve)));
  const messages = [];
  const server = setupServer();
  server.listen({ onUnhandledFrame: rejectUnhandledNetwork((message) => messages.push(message)) });
  t.after(() => server.close());
  t.mock.method(console, "error", () => {});
  const url = `http://127.0.0.1:${origin.address().port}/unexpected`;
  const response = await fetch(url);
  assert.equal(response.status, 500);
  assert.equal(received, 0);
  assert.equal(messages.length, 1);
  assert.ok(messages[0].includes("/unexpected"));
});
