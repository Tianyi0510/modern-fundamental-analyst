import { describe, expect, it } from "vitest";
import { canRecordReplay, createReplayOptions } from "./sentry-replay";

describe("Replay privacy", () => {
  it("excludes recovery URLs and private routes in every locale", () => {
    for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
      for (const route of ["/support", "/subscription-preferences", "/subscription-confirmation"]) {
        expect(canRecordReplay(`${prefix}${route}`)).toBe(false);
      }
      expect(canRecordReplay(`${prefix}/contact?token=synthetic-token`)).toBe(false);
      expect(canRecordReplay(`${prefix}/contact#synthetic-fragment`)).toBe(false);
      expect(canRecordReplay(`${prefix}/contact`)).toBe(true);
      expect(canRecordReplay(`${prefix}/performance`)).toBe(true);
    }
  });

  it("masks content, blocks forms and omits custom recording payloads", () => {
    const options = createReplayOptions();
    expect(options.maskAllText).toBe(true);
    expect(options.maskAllInputs).toBe(true);
    expect(options.blockAllMedia).toBe(true);
    expect(options.block).toContain("form");
    expect(options.networkDetailAllowUrls).toEqual([]);
    expect(options.networkCaptureBodies).toBe(false);
  });
});
