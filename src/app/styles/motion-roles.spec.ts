import { expect, test } from "@playwright/test";

test("Fluent motion aliases and control feedback agree across breakpoints", { tag: "@mobile" }, async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/contact");
  // Microsoft Fluent UI global tokens, verified 2026-10-18.
  const fluentDefaults = {
    "--durationUltraFast": "50ms",
    "--durationFaster": "100ms",
    "--durationFast": "150ms",
    "--durationNormal": "200ms",
    "--durationGentle": "250ms",
    "--durationSlow": "300ms",
    "--durationSlower": "400ms",
    "--durationUltraSlow": "500ms",
    "--curveAccelerateMax": "cubic-bezier(0.9,0.1,1,0.2)",
    "--curveAccelerateMid": "cubic-bezier(1,0,1,1)",
    "--curveAccelerateMin": "cubic-bezier(0.8,0,0.78,1)",
    "--curveDecelerateMax": "cubic-bezier(0.1,0.9,0.2,1)",
    "--curveDecelerateMid": "cubic-bezier(0,0,0,1)",
    "--curveDecelerateMin": "cubic-bezier(0.33,0,0.1,1)",
    "--curveEasyEaseMax": "cubic-bezier(0.8,0,0.2,1)",
    "--curveEasyEase": "cubic-bezier(0.33,0,0.67,1)",
    "--curveLinear": "cubic-bezier(0,0,1,1)",
  };
  const foundation = await page.evaluate((names) => {
    const style = getComputedStyle(document.documentElement);
    return Object.fromEntries(names.map((name) => [name, style.getPropertyValue(name).replace(/\s/g, "")]));
  }, Object.keys(fluentDefaults));
  // Compare numeric values so CSS minification and ms/s serialization do not affect the contract.
  const normalize = (values: Record<string, string>) =>
    Object.fromEntries(
      Object.entries(values).map(([name, value]) => [
        name,
        name.startsWith("--duration")
          ? parseFloat(value) * (value.endsWith("ms") ? 1 : 1000)
          : value
              .slice(value.indexOf("(") + 1, -1)
              .split(",")
              .map(Number),
      ]),
    );
  expect(normalize(foundation)).toEqual(normalize(fluentDefaults));
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const tokens = await page.evaluate(() => {
      const style = getComputedStyle(document.documentElement);
      return Object.fromEntries(
        ["press", "fast", "base", "medium", "slow", "panel-enter", "panel-exit", "enter", "exit"].map((name) => {
          const value = style.getPropertyValue(`--motion-duration-${name}`).trim();
          return [name, parseFloat(value) * (value.endsWith("ms") ? 1 : 1000)];
        }),
      );
    });
    expect(tokens).toEqual({
      press: 100,
      fast: 150,
      base: 200,
      medium: 250,
      slow: 300,
      "panel-enter": 300,
      "panel-exit": 250,
      enter: 250,
      exit: 150,
    });
    const button = page.locator(".contact-submit");
    await expect(button).toHaveCSS("transition-duration", "0.2s");
    await expect(button).toHaveCSS("transition-timing-function", "cubic-bezier(0.33, 0, 0.67, 1)");
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  const durations = await page
    .locator(".contact-submit")
    .evaluate((button) => getComputedStyle(button).transitionDuration.split(",").map(parseFloat));
  for (const duration of durations) expect(duration).toBeLessThanOrEqual(0.00001);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/portfolio");
  await expect(page.locator('[data-slot="table-row"]').first()).toHaveCSS("transition-duration", "0.15s");
  await expect(page.locator('[data-slot="table-row"]').first()).toHaveCSS(
    "transition-timing-function",
    "cubic-bezier(0.33, 0, 0.67, 1)",
  );
});

test("mobile panel uses Fluent entry and exit timing without a reversal jump", { tag: "@mobile" }, async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await page.evaluate(() => {
    // eslint-disable-next-line @typescript-eslint/unbound-method -- Preserve the element receiver with apply.
    const animate = Element.prototype.animate;
    Element.prototype.animate = function (...args) {
      const animation = animate.apply(this, args);
      if (this.matches(".mobile-menu-content")) {
        animation.pause();
        Element.prototype.animate = animate;
      }
      return animation;
    };
  });
  await page.locator(".mobile-menu-button").click();
  const timing = await page.locator(".mobile-menu-content").evaluate((content) => {
    const entrance = content.getAnimations()[0]!;
    const entry = entrance.effect!.getTiming();
    entrance.currentTime = Number(entry.duration) / 2;
    const before = content.getBoundingClientRect().left;
    document.querySelector<HTMLButtonElement>(".mobile-menu-close")!.click();
    const dismissal = content.getAnimations()[0]!;
    dismissal.pause();
    dismissal.currentTime = 0;
    const exit = dismissal.effect!.getTiming();
    const after = content.getBoundingClientRect().left;
    dismissal.play();
    return { entry, exit, before, after };
  });
  expect(timing.entry.duration).toBe(300);
  expect(timing.entry.easing).toBe("cubic-bezier(0.1, 0.9, 0.2, 1)");
  expect(timing.exit.duration).toBe(250);
  expect(timing.exit.easing).toBe("cubic-bezier(0.9, 0.1, 1, 0.2)");
  expect(Math.abs(timing.before - timing.after)).toBeLessThan(1);
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(page.locator(".mobile-menu-button")).toBeFocused();
});

test(
  "monthly disclosure uses contextual timing and settles immediately with reduced motion",
  { tag: "@mobile" },
  async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/performance");
    const details = page.locator('[aria-labelledby="performance-twr-chart-title"] [data-slot=collapsible]');
    const trigger = details.locator("[data-slot=collapsible-trigger]");
    const panel = details.locator("[data-slot=collapsible-content]");
    await trigger.click();
    await expect(details.getByRole("table")).toBeVisible();
    await expect(panel).toHaveCSS("transition-duration", "0.3s");
    await expect(panel).toHaveCSS("transition-timing-function", "cubic-bezier(0.1, 0.9, 0.2, 1)");
    await expect.poll(() => panel.evaluate((element) => element.getAnimations().length)).toBe(0);
    await trigger.click();
    await expect(panel).toHaveAttribute("data-ending-style", "");
    await expect(panel).toHaveCSS("transition-duration", "0.25s");
    await expect(panel).toHaveCSS("transition-timing-function", "cubic-bezier(0.33, 0, 0.67, 1)");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(panel).toBeHidden();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect.poll(() => panel.evaluate((element) => element.getAnimations().length)).toBe(0);
  },
);
