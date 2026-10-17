import { unzipSync } from "node:zlib";

export function decodeReplayRecording(body: Buffer): string {
  let offset = body.indexOf(10) + 1;
  if (offset === 0) throw new Error("Missing envelope header");
  while (offset < body.length) {
    const headerEnd = body.indexOf(10, offset);
    if (headerEnd < 0) throw new Error("Missing item header");
    const value: unknown = JSON.parse(body.subarray(offset, headerEnd).toString("utf8"));
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid item header");
    const header = value as Record<string, unknown>;
    const start = headerEnd + 1;
    if (header.type === "replay_recording") {
      const length = header.length;
      if (typeof length !== "number" || !Number.isSafeInteger(length) || length <= 0)
        throw new Error("Invalid recording length");
      const end = start + length;
      if (end > body.length) throw new Error("Truncated recording");
      const payload = body.subarray(start, end);
      const metadataEnd = payload.indexOf(10);
      if (metadataEnd < 0) throw new Error("Missing recording metadata");
      return unzipSync(payload.subarray(metadataEnd + 1), { maxOutputLength: 10 * 1024 * 1024 }).toString("utf8");
    }
    const itemEnd = body.indexOf(10, start);
    offset = itemEnd < 0 ? body.length : itemEnd + 1;
  }
  throw new Error("Missing Replay recording");
}
