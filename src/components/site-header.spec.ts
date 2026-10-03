import { expect, test, type Page } from "@playwright/test";

async function pauseNextMenuEntrance(page: Page) {
  await page.evaluate(() => {
    // eslint-disable-next-line @typescript-eslint/unbound-method -- The wrapper supplies the original element via apply.
    const animate = Element.prototype.animate;
    // Capture the short entrance before a busy runner can finish the click/tap round trip.
    Element.prototype.animate = function (...args) {
      const animation = animate.apply(this, args);
      if (this.matches(".mobile-menu-content, .mobile-menu-close-icon")) animation.pause();
      if (this.matches(".mobile-menu-close-icon")) Element.prototype.animate = animate;
      return animation;
    };
  });
}

test("language menu supports keyboard entry and Tab exit", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const trigger = page.locator(".language-trigger");
  const items = page.getByRole("menuitem");
  for (const key of ["Enter", "Space", "ArrowDown", "ArrowUp"]) {
    await trigger.focus();
    await page.keyboard.press(key);
    await expect(key === "ArrowUp" ? items.last() : items.first()).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();
  }
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  // Native Tab order may skip links according to the browser's keyboard settings.
  expect(
    await page.evaluate(
      () =>
        document.activeElement !== document.body &&
        !document.querySelector(".language-menu")?.contains(document.activeElement),
    ),
  ).toBe(true);
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await trigger.focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Shift+Tab");
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
});

test("closed language menu removes its focusable links", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const trigger = page.locator(".language-trigger");
  await trigger.click();
  await expect(page.getByRole("menuitem")).toHaveCount(3);
  await page.keyboard.press("Escape");
  await expect(page.locator(".language-dropdown")).toBeHidden();
  await expect(page.getByRole("menuitem")).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("menuitem").first()).toBeFocused();
});

test("mobile menu keeps background isolated through dismissal and then restores focus", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto("/");
  const trigger = page.locator(".mobile-menu-button");
  await trigger.click();
  await trigger.evaluate((element: HTMLButtonElement) => element.focus());
  await expect(page.locator(".mobile-menu-close")).toBeFocused();
  await expect(trigger).toHaveAttribute("tabindex", "-1");
  const state = await page.locator(".mobile-menu-close").evaluate(async (element: HTMLButtonElement) => {
    element.click();
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    return getComputedStyle(document.querySelector(".mobile-menu-layer")!).visibility;
  });
  expect(state).toBe("visible");
  await expect(trigger).toHaveAttribute("tabindex", "-1");
  await expect(page.locator(".mobile-menu-layer")).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(trigger).not.toHaveAttribute("tabindex", "-1");
});

test("mobile menu enters leftward and can exit rightward from an intermediate position", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const trigger = page.locator(".mobile-menu-button");
  await trigger.click();
  const positions = await page.locator(".mobile-menu-content").evaluate((content: HTMLDivElement) => {
    const entrance = content.getAnimations()[0];
    if (!entrance) throw new Error("Menu entrance animation did not start");
    entrance.pause();
    entrance.currentTime = Number(entrance.effect!.getTiming().duration) * 0.45;
    const enteringLeft = content.getBoundingClientRect().left;
    const linksVisible = Array.from(content.querySelectorAll("nav a, .mobile-language-links a")).every((link) => {
      const style = getComputedStyle(link);
      return style.opacity === "1" && style.translate === "none" && link.getAnimations().length === 0;
    });
    const languageLinks = getComputedStyle(content.querySelector(".mobile-language-links")!);
    const languageLinksVisible = languageLinks.opacity === "1" && languageLinks.transform === "none";
    document.querySelector<HTMLButtonElement>(".mobile-menu-close")!.click();
    const dismissal = content.getAnimations()[0];
    if (!dismissal) throw new Error("Menu dismissal animation did not start");
    dismissal.pause();
    dismissal.currentTime = 0;
    const dismissalStartLeft = content.getBoundingClientRect().left;
    dismissal.currentTime = Number(dismissal.effect!.getTiming().duration) * 0.5;
    const dismissalMidLeft = content.getBoundingClientRect().left;
    dismissal.play();
    return { enteringLeft, linksVisible, languageLinksVisible, dismissalStartLeft, dismissalMidLeft };
  });
  expect(positions.enteringLeft).toBeGreaterThan(0);
  expect(positions.enteringLeft).toBeLessThan(390);
  expect(positions.linksVisible).toBe(true);
  expect(positions.languageLinksVisible).toBe(true);
  expect(positions.dismissalStartLeft).toBeCloseTo(positions.enteringLeft, 1);
  expect(positions.dismissalMidLeft).toBeGreaterThan(positions.dismissalStartLeft);
  expect(positions.dismissalMidLeft).toBeLessThan(390);
  await expect(page.locator(".mobile-menu-layer")).toBeHidden();
  await trigger.click();
  await page.locator(".mobile-menu-content").evaluate((content) => {
    const entrance = content.getAnimations()[0];
    if (!entrance) throw new Error("Menu entrance animation did not restart");
    entrance.pause();
    entrance.currentTime = Number(entrance.effect!.getTiming().duration) / 2;
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".mobile-menu-content")).toHaveCSS("transform", "none");
  await expect
    .poll(() => page.locator(".mobile-menu-content").evaluate((content) => content.getAnimations().length))
    .toBe(0);
  await expect(page.locator(".mobile-menu-layer")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator(".mobile-menu-layer")).toBeHidden();
  await trigger.click();
  await expect(page.locator(".mobile-menu-layer")).toBeVisible();
  await expect(page.locator(".mobile-menu-content")).toHaveCSS("transform", "none");
  await expect
    .poll(() => page.locator(".mobile-menu-content").evaluate((content) => content.getAnimations().length))
    .toBe(0);
});

test("menu dismissal handles repeated input and reduced motion in every locale", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
    await page.goto(prefix || "/");
    await page.addStyleTag({ content: "html { font-size: 200%; }" });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    const trigger = page.locator(".mobile-menu-button");
    await trigger.click();
    await expect
      .poll(() => page.locator(".mobile-menu-content").evaluate((content) => content.getAnimations().length))
      .toBe(0);
    const result = await page.locator(".mobile-menu-close").evaluate((element: HTMLButtonElement) => {
      element.click();
      const layer = document.querySelector(".mobile-menu-layer")!;
      const content = layer.querySelector(".mobile-menu-content")!;
      const animation = content.getAnimations()[0];
      if (!animation) throw new Error("Menu dismissal animation did not start");
      animation.pause();
      animation.currentTime = Number(animation.effect!.getTiming().duration) / 2;
      element.click();
      const panel = content.getBoundingClientRect();
      const menuTop = layer.querySelector(".mobile-menu-top")!.getBoundingClientRect();
      const headerWordmark = document.querySelector<HTMLElement>(".site-header > .wordmark")!;
      return {
        count: content.getAnimations().length,
        left: panel.left,
        top: panel.top,
        width: panel.width,
        layerLeft: layer.getBoundingClientRect().left,
        menuTopLeft: menuTop.left,
        menuTopY: menuTop.y,
        menuTopBottom: menuTop.bottom,
        headerWordmarkInert: headerWordmark.inert,
        headerWordmarkTabIndex: headerWordmark.tabIndex,
        locked: getComputedStyle(document.body).overflow,
      };
    });
    expect(result.count).toBe(1);
    expect(result.left).toBeGreaterThan(0);
    expect(result.left).toBeLessThan(320);
    expect(result.top).toBe(result.menuTopBottom);
    expect(result.width).toBeCloseTo(320, 2);
    expect(result.layerLeft).toBe(0);
    expect(result.menuTopLeft).toBe(0);
    expect(result.menuTopY).toBe(0);
    expect(result.headerWordmarkInert).toBe(false);
    expect(result.headerWordmarkTabIndex).toBe(-1);
    expect(result.locked).toBe("hidden");
    // A preference change must also finish an already-running dismissal.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toBeFocused();
    await trigger.click();
    await page.keyboard.press("Escape");
    await expect(page.locator(".mobile-menu-layer")).toBeHidden();
    await expect
      .poll(() => page.evaluate(() => document.querySelector(".mobile-menu-content")?.getAnimations().length ?? 0))
      .toBe(0);
  }
});

test("close button becomes the menu button before the header crossfades", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
    await page.goto(prefix || "/");
    for (let repeat = 0; repeat < 2; repeat++) {
      await page.locator(".mobile-menu-button").click();
      await expect(page.locator(".mobile-menu-close")).toHaveCSS("opacity", "1");
      await expect(page.locator(".mobile-menu-top")).toHaveCSS("opacity", "1");
      const icon = page.locator(".mobile-menu-close-icon");
      await expect
        .poll(() => icon.evaluate((e) => e.getAnimations().filter((a) => a.playState === "running").length))
        .toBe(0);
      await expect
        .poll(() => page.locator(".mobile-menu-content").evaluate((content) => content.getAnimations().length))
        .toBe(0);
      const result = await page.locator(".mobile-menu-close").evaluate((button: HTMLButtonElement) => {
        button.click();
        const layer = document.querySelector(".mobile-menu-layer")!;
        const icon = button.querySelector(".mobile-menu-close-icon")!;
        const returnIcon = button.querySelector(".mobile-menu-return-icon")!;
        const trigger = document.querySelector(".mobile-menu-button")!;
        const content = layer.querySelector(".mobile-menu-content")!;
        const panelAnimation = content.getAnimations()[0]!;
        const iconAnimation = icon.getAnimations().find((a) => !(a instanceof CSSAnimation))!;
        const returnAnimation = returnIcon.getAnimations()[0]!;
        const topBar = layer.querySelector(".mobile-menu-top")!;
        const topBarAnimation = topBar.getAnimations()[0]!;
        const buttonAnimation = button.getAnimations().find((a) => !(a instanceof CSSTransition))!;
        const nav = content.querySelector("nav")!;
        const navAnimation = nav.getAnimations()[0]!;
        panelAnimation.pause();
        iconAnimation.pause();
        returnAnimation.pause();
        buttonAnimation.pause();
        topBarAnimation.pause();
        navAnimation.pause();
        const midpoint = Number(iconAnimation.effect!.getTiming().duration) * 0.55;
        panelAnimation.currentTime = midpoint;
        iconAnimation.currentTime = midpoint;
        returnAnimation.currentTime = midpoint;
        buttonAnimation.currentTime = midpoint;
        topBarAnimation.currentTime = midpoint;
        navAnimation.currentTime = midpoint;
        const closeMatrix = new DOMMatrixReadOnly(getComputedStyle(icon).transform);
        const returnMatrix = new DOMMatrixReadOnly(getComputedStyle(returnIcon).transform);
        const early = {
          closeIconAngle: (Math.atan2(closeMatrix.b, closeMatrix.a) * 180) / Math.PI,
          closeIconOpacity: Number(getComputedStyle(icon).opacity),
          returnIconAngle: (Math.atan2(returnMatrix.b, returnMatrix.a) * 180) / Math.PI,
          returnIconOpacity: Number(getComputedStyle(returnIcon).opacity),
          panelLeft: content.getBoundingClientRect().left,
          navOpacity: Number(getComputedStyle(nav).opacity),
          topBarOpacity: Number(getComputedStyle(topBar).opacity),
          left: layer.getBoundingClientRect().left,
          menuTopLeft: topBar.getBoundingClientRect().left,
          right: button.getBoundingClientRect().right,
        };
        const duration = Number(panelAnimation.effect!.getTiming().duration);
        panelAnimation.currentTime = duration * 0.82;
        iconAnimation.currentTime = Number(iconAnimation.effect!.getTiming().duration);
        buttonAnimation.currentTime = duration * 0.82;
        returnAnimation.currentTime = Number(returnAnimation.effect!.getTiming().duration);
        topBarAnimation.currentTime = duration * 0.82;
        navAnimation.currentTime = Number(navAnimation.effect!.getTiming().duration);
        const late = {
          panelLeft: content.getBoundingClientRect().left,
          navOpacity: Number(getComputedStyle(nav).opacity),
          closeOpacity: Number(getComputedStyle(button).opacity),
          closeIconOpacity: Number(getComputedStyle(icon).opacity),
          returnIconOpacity: Number(getComputedStyle(returnIcon).opacity),
          buttonBackground: getComputedStyle(button).backgroundColor,
          triggerBackground: getComputedStyle(trigger).backgroundColor,
          topBarOpacity: Number(getComputedStyle(topBar).opacity),
        };
        iconAnimation.play();
        returnAnimation.play();
        buttonAnimation.play();
        navAnimation.play();
        topBarAnimation.play();
        panelAnimation.play();
        return { early, late };
      });
      expect(result.early.closeIconOpacity).toBeGreaterThan(0);
      expect(result.early.closeIconOpacity).toBeLessThan(1);
      expect(result.early.closeIconAngle).toBeLessThan(-1);
      expect(result.early.closeIconAngle).toBeGreaterThan(-90);
      expect(result.early.returnIconAngle).toBeGreaterThan(1);
      expect(result.early.returnIconAngle).toBeLessThan(90);
      expect(result.early.returnIconOpacity).toBeGreaterThan(0);
      expect(result.early.returnIconOpacity).toBeLessThan(1);
      expect(result.early.panelLeft).toBeGreaterThan(0);
      expect(result.early.panelLeft).toBeLessThan(result.late.panelLeft);
      expect(result.early.navOpacity).toBeGreaterThan(result.late.navOpacity);
      expect(result.early.topBarOpacity).toBe(1);
      expect(result.late.navOpacity).toBe(0);
      expect(result.late.closeOpacity).toBe(1);
      expect(result.late.closeIconOpacity).toBe(0);
      expect(result.late.returnIconOpacity).toBe(1);
      expect(result.late.buttonBackground).toBe(result.late.triggerBackground);
      expect(result.late.topBarOpacity).toBeGreaterThan(0);
      expect(result.late.topBarOpacity).toBeLessThan(1);
      expect(result.early.left).toBe(0);
      expect(result.early.menuTopLeft).toBe(0);
      expect(result.early.right).toBeLessThanOrEqual(390);
      await expect(page.locator(".mobile-menu-layer")).toBeHidden();
      await expect
        .poll(() => page.evaluate(() => document.querySelector(".mobile-menu-close-icon")?.getAnimations().length ?? 0))
        .toBe(0);
      await expect(page.locator(".mobile-menu-button")).toBeFocused();
    }
  }
});

test("menu hides before releasing the final dismissal frame", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  for (let attempt = 0; attempt < 3; attempt++) {
    await page.locator(".mobile-menu-button").click();
    const visibilityAtCancel = await page.locator(".mobile-menu-close").evaluate(async (button: HTMLButtonElement) => {
      button.click();
      const layer = document.querySelector(".mobile-menu-layer")!;
      const animation = layer.querySelector(".mobile-menu-content")!.getAnimations()[0]!;
      return await new Promise<string>((resolve) => {
        const cancel = animation.cancel.bind(animation);
        animation.cancel = () => {
          const visibility =
            !layer.isConnected || getComputedStyle(layer).visibility === "hidden" ? "hidden" : "visible";
          cancel();
          resolve(visibility);
        };
        animation.finish();
      });
    });
    expect(visibilityAtCancel).toBe("hidden");
    await expect(page.locator(".mobile-menu-button")).toBeFocused();
  }
});

test.describe("repeated touch menu animation", () => {
  test.use({ hasTouch: true });

  test("each opening replays after the hidden state resets", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
      await page.goto(prefix || "/");
      const icon = page.locator(".mobile-menu-close-icon");
      for (let opening = 1; opening <= 3; opening++) {
        await pauseNextMenuEntrance(page);
        await page.locator(".mobile-menu-button").tap();
        const midpoint = await icon.evaluate((element) => {
          const animation = element.getAnimations()[0]!;
          animation.pause();
          animation.currentTime = Number(animation.effect!.getTiming().duration) / 2;
          const transform = getComputedStyle(element).transform;
          animation.play();
          document
            .querySelector(".mobile-menu-content")!
            .getAnimations()
            .forEach((entrance) => entrance.play());
          return transform;
        });
        expect(midpoint).not.toBe("none");
        expect(midpoint).not.toBe("matrix(1, 0, 0, 1, 0, 0)");
        await expect.poll(() => icon.evaluate((element) => element.getAnimations().length)).toBe(0);
        await page.locator(".mobile-menu-close").tap();
        await expect(page.locator(".mobile-menu-layer")).toBeHidden();
        await expect(icon).toHaveCount(0);
      }
    }
  });
});

test("menu icon replays after navigation and returning to a visited page", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  for (const path of ["/about", "/memos", "/", "/portfolio"]) {
    const icon = page.locator(".mobile-menu-close:visible .mobile-menu-close-icon");
    await pauseNextMenuEntrance(page);
    await page.locator(".mobile-menu-button").click();
    const midpoint = await icon.evaluate((element) => {
      const animation = element.getAnimations()[0]!;
      animation.pause();
      animation.currentTime = Number(animation.effect!.getTiming().duration) / 2;
      const transform = getComputedStyle(element).transform;
      animation.play();
      document
        .querySelector(".mobile-menu-content")!
        .getAnimations()
        .forEach((entrance) => entrance.play());
      return transform;
    });
    expect(midpoint).not.toBe("none");
    await expect.poll(() => icon.evaluate((element) => element.getAnimations().length)).toBe(0);
    await page.locator(`.mobile-menu-layer nav a[href="${path}"]`).click();
    await expect(page).toHaveURL(path);
    await expect(page.locator(".mobile-menu-button")).toHaveAttribute("aria-expanded", "false");
  }
});

test.describe("mobile menu touch ring", () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });

  for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
    for (const reducedMotion of ["no-preference", "reduce"] as const) {
      test(`${prefix || "English"} menu touch feedback survives a quick tap and clears cancellation under ${reducedMotion}`, async ({
        page,
      }) => {
        await page.emulateMedia({ reducedMotion });
        await page.goto(prefix || "/");
        const trigger = page.locator(".mobile-menu-button");
        const close = page.locator(".mobile-menu-close");
        const touch = { pointerType: "touch", pointerId: 7, isPrimary: true };
        for (const button of [trigger, close]) {
          if (button === close) await trigger.tap();
          for (let press = 0; press < 2; press++) {
            await button.dispatchEvent("pointerdown", touch);
            await expect(button.locator(".mobile-menu-touch-ring")).toHaveCSS("opacity", "1");
            await expect
              .poll(() =>
                button.evaluate((element) => {
                  const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
                  return Math.round(Math.hypot(matrix.a, matrix.b) * 100);
                }),
              )
              .toBe(reducedMotion === "reduce" ? 100 : 98);
            await button.dispatchEvent("pointercancel", touch);
            if (reducedMotion === "no-preference") {
              const opacity = await button.locator(".mobile-menu-touch-ring").evaluate((ring) => {
                const animation = ring.getAnimations()[0];
                if (!animation) throw new Error("Touch release feedback is missing.");
                animation.pause();
                animation.currentTime = Number(animation.effect!.getTiming().duration) / 2;
                return Number(getComputedStyle(ring).opacity);
              });
              expect(opacity).toBeCloseTo(0.5, 1);
              await button
                .locator(".mobile-menu-touch-ring")
                .evaluate((ring) => ring.getAnimations().forEach((animation) => animation.finish()));
            }
            await expect(button.locator(".mobile-menu-touch-ring")).toHaveCSS("opacity", "0");
          }
        }
        await close.tap();
        await expect(trigger).toHaveAttribute("aria-expanded", "false");
        await trigger.tap();
        if (reducedMotion === "no-preference") {
          // The release animation follows the replacement control even for a real short tap.
          const opacity = await close.locator(".mobile-menu-touch-ring").evaluate((ring) => {
            const animation = ring.getAnimations()[0];
            if (!animation) throw new Error("Quick-tap feedback is missing.");
            animation.pause();
            animation.currentTime = Number(animation.effect!.getTiming().duration) / 2;
            return Number(getComputedStyle(ring).opacity);
          });
          expect(opacity).toBeCloseTo(0.5, 1);
          await close
            .locator(".mobile-menu-touch-ring")
            .evaluate((ring) => ring.getAnimations().forEach((animation) => animation.finish()));
        }
        await expect(close.locator(".mobile-menu-touch-ring")).toHaveCSS("opacity", "0");
        await expect(close).toHaveCSS("border-color", "rgb(0, 0, 0)");
        await expect(close).toHaveCSS("background-color", "rgb(95, 205, 253)");
        await expect(close).toHaveCSS("outline-style", "none");
        await close.tap();
        await expect(trigger).toHaveAttribute("aria-expanded", "false");
        await expect(page.locator("html")).not.toHaveCSS("overflow", "hidden");
      });
    }
  }

  test("blue fill and black border persist without a keyboard outline on touch", async ({ page }) => {
    for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
      await page.goto(prefix || "/");
      for (const route of ["/about", "/memos", "/"]) {
        await page.emulateMedia({ reducedMotion: route === "/" ? "reduce" : "no-preference" });
        await page.locator(".mobile-menu-button").tap();
        const close = page.locator(".mobile-menu-close");
        expect(await close.evaluate((e) => e.matches(":focus-visible"))).toBe(false);
        await expect(close).toHaveCSS("outline-style", "none");
        await expect(close).toHaveCSS("border-color", "rgb(0, 0, 0)");
        await expect(close).toHaveCSS("background-color", "rgb(95, 205, 253)");
        await expect(close).toHaveCSS("color", "rgb(0, 0, 0)");
        const path = route === "/" ? prefix || "/" : `${prefix}${route}`;
        await page.locator(`.mobile-menu-layer nav a[href="${path}"]`).tap();
        await expect(page).toHaveURL(path);
        await expect(page.locator(".mobile-menu-button")).toHaveAttribute("aria-expanded", "false");
      }
    }
  });

  test("mobile language drawer opens and closes on touch", async ({ page }) => {
    for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
      await page.goto(`${prefix}/portfolio`);
      await page.locator(".mobile-menu-button").tap();
      const drawer = page.locator(".mobile-language-disclosure");
      await drawer.locator("summary").tap();
      await expect.poll(() => drawer.evaluate((element) => element.getAnimations().length)).toBe(0);
      await expect(drawer.locator("a").last()).toBeVisible();
      await drawer.locator("summary").tap();
      await expect(drawer).not.toHaveAttribute("open");
      await expect(drawer.locator("a").last()).not.toBeVisible();
    }
  });
});

test("narrow navigation keeps its close control and brand inside the drawer", async ({ page }) => {
  for (const width of [320, 360, 390]) {
    await page.setViewportSize({ width, height: 720 });
    await page.goto("/zh-tw");
    await page.locator(".mobile-menu-button").click();
    await expect
      .poll(() => page.locator(".mobile-menu-content").evaluate((content) => content.getAnimations().length))
      .toBe(0);
    const drawer = page.locator(".mobile-menu-drawer");
    await expect(page.locator(".mobile-menu-close")).toBeFocused();
    for (const fontSize of [16, 32]) {
      await page.evaluate((size) => {
        document.documentElement.style.fontSize = `${size}px`;
      }, fontSize);
      const geometry = await drawer.evaluate((element) => {
        const brand = element.querySelector(".wordmark")!.getBoundingClientRect();
        const close = element.querySelector(".mobile-menu-close")!.getBoundingClientRect();
        return {
          overflow: element.scrollWidth - element.clientWidth,
          brandRight: brand.right,
          closeLeft: close.left,
          closeRight: close.right,
        };
      });
      expect(geometry.overflow).toBeLessThanOrEqual(1);
      expect(geometry.brandRight).toBeLessThanOrEqual(geometry.closeLeft);
      expect(geometry.closeRight).toBeLessThanOrEqual(width - 8);
    }
    await page.keyboard.press("Escape");
    await expect(page.locator(".mobile-menu-button")).toBeFocused();
  }
});

test.describe("header interaction QA", () => {
  test.use({ viewport: { width: 1440, height: 1000 } });

  test("desktop navigation uses stable color, motion, and menu states", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".site-header").first()).toHaveCSS("height", "84px");
    const about = page.locator(".header-actions nav a").filter({ hasText: "About" });
    await about.hover();
    const hoverState = await about.evaluate((element) => {
      const style = getComputedStyle(element);
      return { backgroundColor: style.backgroundColor, transform: style.transform };
    });
    expect(hoverState.backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    expect(hoverState.transform).not.toBe("none");
    await expect(about).toHaveCSS("transform", "matrix(1.04, 0, 0, 1.04, 0, 0)");
    await about.evaluate((element) =>
      element.addEventListener("click", (event) => event.preventDefault(), { once: true }),
    );
    await page.mouse.down();
    try {
      await expect(about).toHaveCSS("transform", "matrix(0.98, 0, 0, 0.98, 0, 0)");
    } finally {
      await page.mouse.up();
    }
    expect(await about.evaluate((element) => getComputedStyle(element, "::after").content)).toBe("none");

    const languageTrigger = page.locator(".language-trigger");
    await expect(languageTrigger.locator("svg")).toHaveAttribute("stroke-width", "2.75");
    await languageTrigger.click();
    await expect(languageTrigger).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator(".language-dropdown")).toBeVisible();
    await expect(page.locator(".language-dropdown")).toHaveCSS("width", "160px");
    for (const item of await page.locator(".language-dropdown a").all()) {
      expect(await item.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
    }
    await page.keyboard.press("Escape");
    await expect(languageTrigger).toHaveAttribute("aria-expanded", "false");
    await expect(languageTrigger).toBeFocused();
  });
});

test.describe("mobile content and navigation QA", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    hasTouch: true,
    isMobile: true,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1",
  });

  test("site header stays in document flow while the menu brand remains pinned", async ({ page }) => {
    await page.goto("/");
    const background = page.locator(".home-header");
    const header = page.locator(".site-header").first();
    await expect(header).toHaveCSS("position", "relative");
    await expect(header).toHaveCSS("height", "70px");
    await expect(header.locator(":scope > .wordmark")).toHaveCSS("white-space", "normal");
    const wordmarkBox = await header.locator(":scope > .wordmark").boundingBox();
    expect(wordmarkBox).not.toBeNull();
    expect(wordmarkBox!.height).toBeLessThanOrEqual(25);
    expect(await page.locator("body").evaluate((element) => getComputedStyle(element).paddingTop)).toBe("0px");
    const topBeforeScroll = await header.boundingBox();
    const backgroundBeforeScroll = await background.boundingBox();
    await page.evaluate(() => window.scrollTo({ top: 700, behavior: "instant" }));
    const topAfterScroll = await header.boundingBox();
    const backgroundAfterScroll = await background.boundingBox();
    expect(topBeforeScroll).not.toBeNull();
    expect(topAfterScroll).not.toBeNull();
    expect(backgroundBeforeScroll).not.toBeNull();
    expect(backgroundAfterScroll).not.toBeNull();
    expect(topBeforeScroll!.y).toBe(0);
    expect(topAfterScroll!.y).toBeLessThan(-100);
    expect(topBeforeScroll!.x).toBe(16);
    expect(topBeforeScroll!.width).toBe(358);
    expect(topAfterScroll!.width).toBe(358);
    expect(backgroundBeforeScroll!.x).toBe(0);
    expect(backgroundBeforeScroll!.width).toBe(390);
    expect(backgroundAfterScroll!.width).toBe(390);
  });

  test("mobile menu opens, traps focus, and closes from its visible control", async ({ page }) => {
    await page.goto("/");
    await page.locator(".mobile-menu-button").tap();
    await expect(page.locator(".mobile-menu-layer")).toBeVisible();
    await expect(page.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
    await expect(page.locator(".mobile-menu-close")).toBeFocused();
    await expect
      .poll(() => page.locator(".mobile-menu-close").evaluate((element) => getComputedStyle(element).transform))
      .toBe("none");
    await expect(page.locator(".mobile-menu-drawer nav a")).toHaveCount(6);
    await expect(page.locator(".mobile-menu-index")).toHaveCount(0);
    await expect(page.locator(".mobile-menu-label")).toHaveText([
      "Home",
      "About",
      "Portfolio",
      "Performance",
      "Investment Memos",
      "Contact",
    ]);
    await expect(page.locator(".mobile-menu-drawer nav svg")).toHaveCount(0);
    await expect(page.locator(".mobile-language-links a")).toHaveCount(2);
    await expect(page.locator(".mobile-language-links a").first()).toHaveCSS("color", "rgb(0, 0, 0)");
    await expect(page.locator(".mobile-language-links a").nth(1)).toHaveCSS("color", "rgb(0, 0, 0)");
    await expect(page.locator(".mobile-language-links summary svg")).toHaveCount(1);
    await expect(page.locator(".mobile-language-links a").first()).toHaveCSS("border-top-width", "0px");
    const drawer = page.locator(".mobile-menu-drawer");
    await expect(drawer).toHaveCSS("transform", "none");
    await expect(drawer).toHaveCSS("opacity", "1");
    await expect(drawer).toHaveCSS("clip-path", "none");
    const drawerBox = await drawer.boundingBox();
    expect(drawerBox).not.toBeNull();
    expect(drawerBox!.x).toBe(0);
    expect(drawerBox!.width).toBe(390);
    await expect(page.locator('.mobile-menu-drawer nav a[aria-current="page"]')).toHaveCSS(
      "background-color",
      "rgba(0, 0, 0, 0)",
    );
    await expect(page.locator('.mobile-menu-drawer nav a[aria-current="page"]')).toHaveCSS("color", "rgb(0, 140, 255)");
    await expect(page.locator('.mobile-menu-drawer nav a[aria-current="page"]')).toHaveCSS("border-radius", "0px");
    await expect(page.locator(".mobile-menu-drawer nav a").first()).toHaveCSS("padding-left", "8px");
    await expect(page.locator(".mobile-menu-language").first()).toHaveCSS("padding-left", "8px");
    const menuTop = page.locator(".mobile-menu-top");
    const topBeforeScroll = await menuTop.boundingBox();
    expect(topBeforeScroll).not.toBeNull();
    expect(topBeforeScroll!.x).toBe(0);
    expect(topBeforeScroll!.y).toBe(0);
    expect(topBeforeScroll!.width).toBe(390);
    await expect(menuTop).toHaveCSS("background-color", "rgb(255, 255, 255)");
    await expect(drawer).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(page.locator(".mobile-menu-content")).toHaveCSS("background-color", "rgb(255, 255, 255)");
    await expect(drawer).toHaveCSS("padding-top", "0px");
    await expect(page.locator(".mobile-menu-wordmark")).toHaveCSS("transition-duration", "0s");
    await expect(page.locator(".mobile-menu-wordmark")).toHaveCSS("white-space", "normal");
    await page.setViewportSize({ width: 390, height: 620 });
    await page
      .locator(".mobile-menu-content")
      .evaluate((element) => element.scrollTo({ top: 160, behavior: "instant" }));
    const topAfterScroll = await menuTop.boundingBox();
    expect(topAfterScroll).not.toBeNull();
    expect(topAfterScroll!.y).toBe(topBeforeScroll!.y);
    await page.locator(".mobile-menu-close").tap();
    await expect(page.locator(".mobile-menu-layer")).toBeHidden();
    await expect(page.locator(".mobile-menu-button")).toBeFocused();
  });

  test("mobile menu locks and restores the underlying scroll position", async ({ page, browserName }) => {
    await page.goto("/");
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollHeight)).toBeGreaterThan(1000);
    await page.evaluate(() => window.scrollTo({ top: 700, behavior: "instant" }));
    const scrollPosition = await page.evaluate(() => window.scrollY);
    expect(scrollPosition).toBeGreaterThan(0);
    await page.locator(".mobile-menu-button").evaluate((button) => (button as HTMLButtonElement).click());
    await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
    if (browserName === "webkit") await page.keyboard.press("PageDown");
    else await page.mouse.wheel(0, 300);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(scrollPosition);
    await page.locator(".mobile-menu-close").tap();
    await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(scrollPosition);
  });

  test("mobile menu supports a deliberate right-swipe close gesture", async ({ page }) => {
    await page.goto("/");
    await page.locator(".mobile-menu-button").tap();
    const drawer = page.locator(".mobile-menu-drawer");
    const start = { pointerType: "touch", pointerId: 1, isPrimary: true, clientX: 40, clientY: 240 };
    const end = { ...start, clientX: 150, clientY: 246 };
    // A second finger cancels the gesture, even when the first finger finishes it.
    await drawer.dispatchEvent("pointerdown", start);
    await drawer.dispatchEvent("pointerdown", { ...start, pointerId: 2, isPrimary: false });
    await drawer.dispatchEvent("pointerup", end);
    await expect(page.locator(".mobile-menu-layer")).toBeVisible();
    await drawer.dispatchEvent("pointerdown", start);
    await drawer.dispatchEvent("pointercancel", start);
    await drawer.dispatchEvent("pointerup", end);
    await expect(page.locator(".mobile-menu-layer")).toBeVisible();
    await drawer.dispatchEvent("pointerdown", start);
    await drawer.dispatchEvent("pointerup", { ...end, pointerId: 2 });
    await expect(page.locator(".mobile-menu-layer")).toBeVisible();
    await drawer.dispatchEvent("pointerdown", start);
    await drawer.dispatchEvent("pointerup", end);
    await expect(page.locator(".mobile-menu-layer")).toBeHidden();
  });

  test("navigation switches without overlap or a stranded scroll lock", async ({ page }) => {
    await page.goto("/");
    await page.locator(".mobile-menu-button").tap();
    await expect(page.locator(".mobile-menu-layer")).toBeVisible();
    await page.setViewportSize({ width: 801, height: 1000 });
    await expect(page.locator(".mobile-menu-close")).toBeVisible();
    await page.setViewportSize({ width: 1440, height: 1000 });
    await expect(page.locator(".mobile-menu-layer")).toBeHidden();
    await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
    await expect(page.locator("html")).not.toHaveCSS("overflow", "hidden");
    for (const width of [801, 1100, 1150, 1151, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      const logo = await page.locator(".site-header > .wordmark").boundingBox();
      const adjacent = await page.locator(width <= 1150 ? ".mobile-menu-button" : ".header-actions").boundingBox();
      expect(logo!.x + logo!.width).toBeLessThan(adjacent!.x);
    }
  });

  test("Escape completes dismissal and rapid taps do not queue animations", async ({ page }) => {
    await page.goto("/");
    await page.locator(".mobile-menu-button").evaluate(async (button) => {
      (button as HTMLButtonElement).click();
      (button as HTMLButtonElement).click();

      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    });
    await page.keyboard.press("Escape");
    await expect(page.locator(".mobile-menu-layer")).toBeHidden();
    await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
    for (let count = 0; count < 3; count++) {
      await page.locator(".mobile-menu-button").tap();
      await expect(page.locator(".mobile-menu-layer")).toBeVisible();
      await page.locator(".mobile-menu-close").tap();
      await expect(page.locator(".mobile-menu-layer")).toBeHidden();
    }
  });
});

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  for (const reducedMotion of ["no-preference", "reduce"] as const) {
    test(`${prefix || "English"} mobile language drawer expands vertically and restores focus under ${reducedMotion}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.emulateMedia({ reducedMotion });
      await page.goto(`${prefix}/portfolio`);
      await page.locator(".mobile-menu-button").click();
      const close = page.locator(".mobile-menu-close");
      await expect(close).toHaveCSS("border-color", "rgb(0, 0, 0)");
      await close.hover();
      await expect(close).toHaveCSS("border-color", "rgb(0, 0, 0)");
      const drawer = page.locator(".mobile-language-disclosure");
      const summary = drawer.locator("summary");
      const options = drawer.locator("a");
      await expect(drawer).not.toHaveAttribute("open");
      await expect(options.first()).not.toBeVisible();
      await summary.focus();
      await page.keyboard.press("Tab");
      await expect(page.locator(".mobile-menu-wordmark")).toBeFocused();
      await page.keyboard.press("Shift+Tab");
      await expect(summary).toBeFocused();
      const collapsedHeight = await drawer.evaluate((element) => element.getBoundingClientRect().height);
      await summary.focus();
      await page.keyboard.press("Enter");
      await expect(drawer).toHaveAttribute("open", "");
      await expect.poll(() => drawer.evaluate((element) => element.getAnimations().length)).toBe(0);
      await expect(options).toHaveCount(2);
      await expect(drawer.locator(`a[href="${prefix}/portfolio"]`)).toHaveCount(0);
      await expect(options.first()).toBeVisible();
      expect(await drawer.evaluate((element) => element.getBoundingClientRect().height)).toBeGreaterThan(
        collapsedHeight,
      );
      await page.keyboard.press("Tab");
      await expect(options.first()).toBeFocused();
      await summary.evaluate((element: HTMLElement) => element.click());
      await expect(drawer).not.toHaveAttribute("open");
      await expect(summary).toBeFocused();
      await expect(options.first()).not.toBeVisible();
      await page.keyboard.press("Space");
      await expect(drawer).toHaveAttribute("open", "");
      await expect.poll(() => drawer.evaluate((element) => element.getAnimations().length)).toBe(0);
      if (reducedMotion === "no-preference") {
        await summary.evaluate((element: HTMLElement) => {
          element.click();
          const animation = element.parentElement!.getAnimations()[0]!;
          animation.pause();
          animation.currentTime = Number(animation.effect!.getTiming().duration) / 2;
          element.click();
        });
        await expect.poll(() => drawer.evaluate((element) => element.getAnimations().length)).toBe(0);
        await expect(drawer).toHaveAttribute("open", "");
      }
      await page.evaluate(() => (document.documentElement.style.fontSize = "200%"));
      await expect(options.last()).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
      const target = prefix === "/zh-tw" ? "/portfolio" : "/zh-tw/portfolio";
      await drawer.locator(`a[href="${target}"]`).click();
      await expect(page).toHaveURL(new RegExp(`${target}$`));
      await expect(page.locator(".mobile-menu-button")).toHaveAttribute("aria-expanded", "false");
    });
  }

  test(`${prefix || "English"} mobile menu choices preserve color feedback and mark keyboard focus`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${prefix}/portfolio`);
    const brand = page.locator(".site-header > .wordmark");
    await expect(brand).toHaveCSS("padding-left", "4px");
    await page.locator(".mobile-menu-button").click();
    await expect(page.locator(".mobile-menu-wordmark")).toHaveCSS("padding-left", "4px");
    await expect
      .poll(() => page.evaluate(() => document.querySelector(".mobile-menu-content")?.getAnimations().length ?? 0))
      .toBe(0);
    await page.locator(".mobile-language-disclosure > summary").click();
    await expect
      .poll(() => page.locator(".mobile-language-disclosure").evaluate((element) => element.getAnimations().length))
      .toBe(0);
    const links = page.locator(
      ".mobile-menu-drawer nav a, .mobile-menu-language, .mobile-language-disclosure > summary",
    );
    for (const link of await links.all()) {
      await expect(link).toHaveCSS("border-top-width", "0px");
      await expect(link).toHaveCSS("border-bottom-width", "0px");
      await expect(link).toHaveCSS("padding-left", "8px");
      await expect(link).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
      await expect(link).toHaveCSS("transition-property", "color");
      await expect(link).toHaveCSS("transition-duration", "0.14s");
      await expect(link).toHaveCSS("transition-timing-function", "cubic-bezier(0.2, 0, 0, 1)");
      await expect(link).toHaveCSS("transform", "none");
      const originalBox = await link.boundingBox();
      const initialColor = await link.evaluate((element) => getComputedStyle(element).color);
      await link.hover();
      if (initialColor !== "rgb(0, 140, 255)") {
        const midpointColor = await link.evaluate((element) => {
          const transition = element
            .getAnimations()
            .find((animation) => animation instanceof CSSTransition && animation.transitionProperty === "color");
          if (!transition) throw new Error("Menu color transition did not start");
          transition.pause();
          transition.currentTime = Number(transition.effect!.getTiming().duration) / 2;
          const color = getComputedStyle(element).color;
          transition.play();
          return color;
        });
        expect(midpointColor).not.toBe(initialColor);
        expect(midpointColor).not.toBe("rgb(0, 140, 255)");
      }
      await expect(link).toHaveCSS("color", "rgb(0, 140, 255)");
      await expect(link).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
      await expect(link).toHaveCSS("transform", "none");
      await page.keyboard.press("Tab");
      await link.focus();
      await expect(link).toBeFocused();
      await expect(link).toHaveCSS("color", "rgb(0, 140, 255)");
      await expect(link).toHaveCSS("outline-style", "none");
      await expect(link).toHaveCSS("text-decoration-line", "underline");
      await expect(link).toHaveCSS("text-decoration-thickness", "2px");
      await page.mouse.down();
      await expect(link).toHaveCSS("color", "rgb(0, 140, 255)");
      await expect(link).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
      await expect(link).toHaveCSS("transform", "none");
      await expect(link).toHaveCSS("border-radius", "0px");
      expect(await link.boundingBox()).toEqual(originalBox);
      // Release away from the link so testing its pressed state does not navigate.
      await page.mouse.move(0, 0);
      await page.mouse.up();
    }
    await page.keyboard.press("Escape");
    await expect(page.locator(".mobile-menu-button")).toBeFocused();
  });
}

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  for (const reducedMotion of ["no-preference", "reduce"] as const) {
    test(`${prefix || "English"} mobile menu outer ring appears for keyboard focus under ${reducedMotion}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.emulateMedia({ reducedMotion });
      await page.goto(prefix || "/");
      await page.locator(".mobile-menu-button").click();
      await expect
        .poll(() => page.evaluate(() => document.querySelector(".mobile-menu-content")?.getAnimations().length ?? 0))
        .toBe(0);
      await page.keyboard.press("Tab");
      const close = page.locator(".mobile-menu-close");
      await expect
        .poll(async () => {
          await close.focus();
          return close.evaluate((element) => element === document.activeElement);
        })
        .toBe(true);
      expect(await close.evaluate((element) => element.matches(":focus-visible"))).toBe(true);
      await expect(close).toHaveCSS("outline-style", "solid");
      await expect(close).toHaveCSS("outline-width", "2px");
      await expect(close).toHaveCSS("outline-color", "rgb(0, 140, 255)");
      await expect(close).toHaveCSS("background-color", "rgb(95, 205, 253)");
      await page.keyboard.press("Escape");
      await expect(page.locator(".mobile-menu-button")).toBeFocused();
    });
  }
}

test.describe("touch CTA recovery", () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });

  for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
    test(`${prefix || "English"} mobile current and expanded choices have independent keyboard markers`, async ({
      page,
    }) => {
      await page.goto(`${prefix}/portfolio`);
      await page.locator(".mobile-menu-button").tap();
      const current = page.locator('.mobile-menu-drawer nav a[aria-current="page"]');
      const summary = page.locator(".mobile-language-disclosure > summary");
      await expect(current).toHaveCSS("text-decoration-line", "none");
      await page.keyboard.press("Tab");
      await current.focus();
      await expect(current).toHaveCSS("color", "rgb(0, 140, 255)");
      await expect(current).toHaveCSS("text-decoration-line", "underline");
      await summary.focus();
      await expect(current).toHaveCSS("text-decoration-line", "none");
      await page.keyboard.press("Enter");
      await expect(summary).toHaveCSS("color", "rgb(0, 140, 255)");
      await expect(summary).toHaveCSS("text-decoration-line", "underline");
      await page.keyboard.press("Tab");
      const option = page.locator(".mobile-menu-language").first();
      await expect(option).toBeFocused();
      await expect(option).toHaveCSS("text-decoration-line", "underline");
      await expect(summary).toHaveCSS("text-decoration-line", "none");
      await expect(summary).toHaveCSS("color", "rgb(0, 140, 255)");
      await page.emulateMedia({ reducedMotion: "reduce" });
      await expect(option).toHaveCSS("text-decoration-line", "underline");
      await page.keyboard.press("Escape");
      await expect(page.locator(".mobile-menu-button")).toBeFocused();
    });
  }
});

for (const prefix of ["", "/zh-tw", "/zh-cn"]) {
  test(`${prefix || "English"} dismissal blocks navigation while retaining focus and animation`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto(`${prefix}/portfolio`);
    const trigger = page.locator(".mobile-menu-button");
    const close = page.locator(".mobile-menu-close");
    const drawer = page.locator(".mobile-menu-drawer");
    const content = page.locator(".mobile-menu-content");
    for (const method of ["close", "escape"]) {
      await trigger.click();
      await expect(page.locator(".mobile-menu-layer")).toHaveAttribute("data-menu-phase", "open");
      await drawer.locator("nav a").first().focus();
      await close.evaluate((button: HTMLButtonElement, method) => {
        if (method === "close") button.click();
        else document.activeElement?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
        const panel = document.querySelector(".mobile-menu-content")!;
        const animation = panel.getAnimations()[0];
        if (!animation) throw new Error("Dismissal must retain its visible animation");
        animation.pause();
        animation.currentTime = 0;
      }, method);
      await expect(page.locator(".mobile-menu-layer")).toHaveAttribute("data-menu-phase", "closing");
      await expect(content).toHaveAttribute("inert", "");
      await expect(close).toBeFocused();
      await expect(trigger).toHaveAttribute("tabindex", "-1");
      for (const key of ["Tab", "Shift+Tab"]) {
        await page.keyboard.press(key);
        await expect(close).toBeFocused();
      }
      for (const selector of ["nav a", ".mobile-language-disclosure > summary", ".mobile-menu-wordmark"]) {
        await close.focus();
        const target = drawer.locator(selector).first();
        await target.evaluate((element: HTMLElement) => element.focus());
        await expect(close).toBeFocused();
        const box = await target.boundingBox();
        if (!box) throw new Error("Closing content should remain rendered for animation");
        await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
        await expect(page).toHaveURL(new RegExp(`${prefix}/portfolio$`));
        await expect(page.locator(".mobile-menu-layer")).toHaveAttribute("data-menu-phase", "closing");
      }
      await content.evaluate((element) => element.getAnimations().forEach((animation) => animation.finish()));
      await expect(drawer).toHaveCount(0);
      await expect(trigger).toBeFocused();
    }
    await trigger.click();
    await drawer.locator(`nav a[href="${prefix}/about"]`).click();
    await expect(page).toHaveURL(new RegExp(`${prefix}/about$`));
  });
}
