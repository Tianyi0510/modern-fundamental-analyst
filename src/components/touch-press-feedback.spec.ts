import { expect, test, type Locator } from "@playwright/test";

async function scale(control: Locator) {
  return control.evaluate((element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).a);
}

async function prepare(control: Locator) {
  await control.scrollIntoViewIfNeeded();
  await control.evaluate((element) => {
    // Exercise feedback without navigating or submitting to a provider.
    element.addEventListener("click", (event) => event.preventDefault(), { capture: true });
  });
}

test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

for (const reducedMotion of ["no-preference", "reduce"] as const) {
  for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
    test(`trusted touch holds and repeated releases ${prefix || "en"} ${reducedMotion}`, async ({
      page,
      browserName,
    }) => {
      test.skip(
        browserName !== "chromium",
        "CDP provides trusted held-touch input only in Chromium; WebKit taps are tested separately.",
      );
      await page.emulateMedia({ reducedMotion });
      const session = await page.context().newCDPSession(page);
      for (const [route, selectors] of [
        ["", [".hero .button", ".round-link", ".performance-home .button-white", "#subscribe button[type=submit]"]],
        ["/contact", [".contact-submit"]],
        ["/support", [".support-submit"]],
      ] as const) {
        await page.goto(`${prefix}${route}` || "/");
        await page.evaluate(() => {
          document.documentElement.style.scrollBehavior = "auto";
        });
        for (const selector of selectors) {
          const control = page.locator(selector).first();
          await prepare(control);
          for (const release of ["touchEnd", "touchCancel", "touchEnd"] as const) {
            const box = (await control.boundingBox())!;
            await session.send("Input.dispatchTouchEvent", {
              type: "touchStart",
              touchPoints: [{ x: box.x + box.width / 2, y: box.y + box.height / 2 }],
            });
            await expect(control).toHaveAttribute("data-touch-pressed", "true");
            await expect.poll(() => scale(control)).toBeCloseTo(reducedMotion === "reduce" ? 1 : 0.98, 3);
            await session.send("Input.dispatchTouchEvent", { type: release, touchPoints: [] });
            await expect(control).not.toHaveAttribute("data-touch-pressed");
            await expect.poll(() => scale(control)).toBeCloseTo(1, 3);
          }
        }
      }
      await session.detach();
    });
  }

  test(`touch cancellation, disabled controls and native taps ${reducedMotion}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion });
    await page.goto("/");
    await page.evaluate(() => {
      document.documentElement.style.scrollBehavior = "auto";
    });
    const control = page.locator(".hero .button").first();
    await prepare(control);
    for (const cancellation of [
      "pointercancel",
      "lostpointercapture",
      "pointermove",
      "scroll",
      "blur",
      "pagehide",
    ] as const) {
      // Explicit event-contract checks; these are not a substitute for trusted device input.
      await control.dispatchEvent("pointerdown", {
        pointerType: "touch",
        pointerId: 7,
        isPrimary: true,
        clientX: 0,
        clientY: 0,
      });
      await expect(control).toHaveAttribute("data-touch-pressed", "true");
      await expect.poll(() => scale(control)).toBeCloseTo(reducedMotion === "reduce" ? 1 : 0.98, 3);
      if (cancellation === "blur" || cancellation === "pagehide") {
        await page.evaluate((name) => window.dispatchEvent(new Event(name)), cancellation);
      } else {
        await control.dispatchEvent(cancellation, { pointerType: "touch", pointerId: 7, clientX: 30, clientY: 30 });
      }
      await expect(control).not.toHaveAttribute("data-touch-pressed");
      await expect.poll(() => scale(control)).toBeCloseTo(1, 3);
    }
    for (let i = 0; i < 3; i++) {
      await control.tap();
      await expect(control).not.toHaveAttribute("data-touch-pressed");
      await expect.poll(() => scale(control)).toBeCloseTo(1, 3);
    }
    const button = page.locator("#subscribe button[type=submit]");
    await button.evaluate((element: HTMLButtonElement) => {
      element.disabled = true;
    });
    await button.dispatchEvent("pointerdown", { pointerType: "touch", pointerId: 8, isPrimary: true });
    await expect(button).not.toHaveAttribute("data-touch-pressed");
    expect(await scale(button)).toBe(1);
  });
}

test("touch feedback preserves native navigation and one form submission", async ({ page }) => {
  await page.goto("/");
  await page.locator(".hero .button").first().tap();
  await expect(page).toHaveURL(/\/portfolio$/);
  await expect(page.locator("[data-touch-pressed]")).toHaveCount(0);

  let submissions = 0;
  await page.route("**/api/subscription-confirmation", async (route) => {
    submissions++;
    await route.fulfill({ json: { success: true } });
  });
  await page.goto(`/subscription-confirmation?token=${"a".repeat(43)}`);
  const submit = page.locator("main form button");
  await submit.tap();
  await expect(submit).toBeDisabled();
  await expect(submit).not.toHaveAttribute("data-touch-pressed");
  await expect.poll(() => submissions).toBe(1);
});
