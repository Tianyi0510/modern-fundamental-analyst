import assert from "node:assert/strict";
import test from "node:test";
import { deflateSync, gzipSync } from "node:zlib";
import { decodeReplayRecording } from "./sentry-envelope.ts";

function envelope(recording, compress = deflateSync) {
  const payload = Buffer.concat([Buffer.from('{"segment_id":0}\n'), compress(Buffer.from(recording))]);
  return Buffer.concat([
    Buffer.from('{"event_id":"synthetic"}\n{"type":"replay_event"}\n{"title":"中文"}\n'),
    Buffer.from(JSON.stringify({ type: "replay_recording", length: payload.length }) + "\n"),
    payload,
  ]);
}

test("decodes byte-sized zlib and gzip recordings after multibyte envelope items", () => {
  const recording = JSON.stringify([{ text: "中文", childNodes: [] }]);
  assert.equal(decodeReplayRecording(envelope(recording)), recording);
  assert.equal(decodeReplayRecording(envelope(recording, gzipSync)), recording);
});

test("rejects truncated recordings rather than accepting incomplete privacy evidence", () => {
  const body = envelope("[]");
  assert.throws(() => decodeReplayRecording(body.subarray(0, body.length - 1)), /Truncated/);
});

test("requires a recording item and a positive byte length", () => {
  assert.throws(() => decodeReplayRecording(Buffer.from('{}\n{"type":"event"}\n{}')), /Missing Replay/);
  assert.throws(
    () => decodeReplayRecording(Buffer.from('{}\n{"type":"replay_recording","length":0}\n')),
    /Invalid recording length/,
  );
});
