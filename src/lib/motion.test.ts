import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { motionSprings, motionTokenDeclarations, springFrames, springState, springTiming } from "./motion";

describe("M3 Expressive spring physics", () => {
  it("evaluates the critically damped solution independently of sampling", () => {
    const state = springState("effectsDefault", 1 / 40);
    expect(state.value).toBeCloseTo(1 - 2 / Math.E, 10);
    expect(state.velocity).toBeCloseTo(40 / Math.E, 10);
  });

  it("preserves position and velocity when a moving spring is retargeted", () => {
    const moving = springState("spatialSlow", 0.12, 390, 0);
    const reversed = springState("spatialSlow", 0, moving.value, 390, moving.velocity);
    expect(reversed.value).toBeCloseTo(moving.value, 10);
    expect(reversed.velocity).toBeCloseTo(moving.velocity, 10);
    // A reversal retains momentum before acceleration changes its direction.
    expect(springState("spatialSlow", 0.001, moving.value, 390, moving.velocity).value).toBeLessThan(moving.value);
  });

  for (const preset of Object.keys(motionSprings) as (keyof typeof motionSprings)[]) {
    it(`${preset} settles at its target with bounded, finite samples`, () => {
      const frames = springFrames(preset);
      expect(frames.values[0]).toBe(0);
      expect(frames.values.at(-1)).toBe(1);
      expect(frames.values.every(Number.isFinite)).toBe(true);
      expect(frames.duration).toBeGreaterThan(0);
      expect(frames.duration).toBeLessThan(1000);
      const beforeSnap = springState(preset, frames.duration / 1000);
      expect(Math.abs(beforeSnap.value - 1)).toBeLessThan(0.001);
      expect(Math.abs(beforeSnap.velocity)).toBeLessThan(0.01);
      expect(springTiming(preset).easing).toMatch(/^linear\(/);
    });
  }

  it.each(["effectsFast", "effectsDefault", "effectsSlow"] as const)(
    "%s never overshoots or reverses an opacity fade",
    (preset) => {
      const { values } = springFrames(preset);
      expect(values.every((value, i) => value >= 0 && value <= 1 && (i === 0 || value >= values[i - 1]!))).toBe(true);
    },
  );

  it.each(["spatialFast", "spatialDefault", "spatialSlow"] as const)(
    "%s permits controlled spatial overshoot",
    (preset) => {
      expect(Math.max(...springFrames(preset).values)).toBeGreaterThan(1);
      expect(Math.max(...springFrames(preset).values)).toBeLessThan(1.1);
    },
  );

  it("keeps static CSS tokens synchronized with the authoritative physics presets", () => {
    const css = readFileSync(new URL("../app/styles/tokens.css", import.meta.url), "utf8");
    const declarations = (value: string) =>
      new Map(
        [...value.matchAll(/(--motion-(?:spatial|effects)-[\w-]+):\s*([^;]+);/g)].map((match) => [
          match[1],
          match[2]!.replace(/\s+/g, ""),
        ]),
      );
    expect(declarations(css)).toEqual(declarations(motionTokenDeclarations()));
  });
});
