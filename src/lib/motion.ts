/** M3 Expressive spring parameters, mass = 1; see DESIGN_SYSTEM.md for provenance. */
export const motionSprings = {
  spatialFast: { stiffness: 800, damping: 0.6 },
  spatialDefault: { stiffness: 380, damping: 0.8 },
  spatialSlow: { stiffness: 200, damping: 0.8 },
  effectsFast: { stiffness: 3800, damping: 1 },
  effectsDefault: { stiffness: 1600, damping: 1 },
  effectsSlow: { stiffness: 800, damping: 1 },
} as const;
export type MotionSpring = keyof typeof motionSprings;

/** Value and velocity in units/second, evaluated analytically without frame integration drift. */
export function springState(preset: MotionSpring, seconds: number, from = 0, to = 1, velocity = 0) {
  const { stiffness, damping } = motionSprings[preset];
  const omega = Math.sqrt(stiffness);
  const displacement = from - to;
  const decay = Math.exp(-damping * omega * seconds);
  if (damping === 1) {
    const coefficient = velocity + omega * displacement;
    return {
      value: to + (displacement + coefficient * seconds) * decay,
      velocity: (velocity - omega * coefficient * seconds) * decay,
    };
  }
  const frequency = omega * Math.sqrt(1 - damping * damping);
  const coefficient = (velocity + damping * omega * displacement) / frequency;
  const cosine = Math.cos(frequency * seconds);
  const sine = Math.sin(frequency * seconds);
  const wave = displacement * cosine + coefficient * sine;
  return {
    value: to + decay * wave,
    velocity: decay * (-damping * omega * wave - displacement * frequency * sine + coefficient * frequency * cosine),
  };
}

export function springFrames(preset: MotionSpring, from = 0, to = 1, velocity = 0) {
  // Require a quiet tail, so an early crossing of the target cannot end a spatial spring.
  const scale = Math.max(Math.abs(to - from), 1);
  let quiet = 0;
  let count = 1;
  for (; count < 240; count++) {
    const state = springState(preset, count / 120, from, to, velocity);
    quiet = Math.abs(state.value - to) < scale * 0.001 && Math.abs(state.velocity) < scale * 0.01 ? quiet + 1 : 0;
    if (quiet >= 6) break;
  }
  const values = Array.from({ length: count + 1 }, (_, i) =>
    i === count ? to : springState(preset, i / 120, from, to, velocity).value,
  );
  return { values, duration: (count / 120) * 1000 };
}

/** CSS and WAAPI use the same physical presets. CSS transitions start with zero velocity. */
export function springTiming(preset: MotionSpring) {
  const { values, duration } = springFrames(preset);
  return { duration, easing: `linear(${values.map((value) => Number(value.toFixed(5))).join(", ")})` };
}

export function motionTokenDeclarations() {
  return Object.keys(motionSprings)
    .map((name) => {
      const preset = name as MotionSpring;
      const token = name.replace(/([A-Z])/g, "-$1").toLowerCase();
      const { duration, easing } = springTiming(preset);
      return `  --motion-${token}-duration: ${Number(duration.toFixed(3))}ms;\n  --motion-${token}-easing: ${easing};`;
    })
    .join("\n");
}

const trajectories = new WeakMap<Animation, { preset: MotionSpring; from: number; to: number; velocity: number }>();

export function animationVelocity(animation: Animation | null) {
  if (!animation || animation.playState === "finished" || animation.playState === "idle") return 0;
  const trajectory = trajectories.get(animation);
  if (!trajectory) return 0;
  const { preset, from, to, velocity } = trajectory;
  return springState(preset, Number(animation.currentTime ?? 0) / 1000, from, to, velocity).velocity;
}

export function animateSpringValue(
  element: Element,
  from: number,
  to: number,
  render: (value: number) => Keyframe,
  preset: MotionSpring,
  velocity = 0,
  fill: FillMode = "forwards",
) {
  const { values, duration } = springFrames(preset, from, to, velocity);
  const animation = element.animate(values.map(render), { duration, easing: "linear", fill });
  trajectories.set(animation, { preset, from, to, velocity });
  return animation;
}
