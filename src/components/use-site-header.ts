"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEventHandler,
  type RefObject,
} from "react";

// Touch feedback spans both buttons because opening replaces the trigger with the close control.
export function useMenuTouchFeedback(
  triggerRef: RefObject<HTMLButtonElement | null>,
  closeRef: RefObject<HTMLButtonElement | null>,
) {
  const pointerRef = useRef<number | null>(null);
  const buttonsRef = useRef(new Set<HTMLButtonElement>());
  const attachClose = useCallback(
    (button: HTMLButtonElement | null) => {
      const previous = closeRef.current;
      if (previous && previous !== button) {
        previous
          .querySelector(".mobile-menu-touch-ring")
          ?.getAnimations()
          .forEach((animation) => animation.cancel());
        buttonsRef.current.delete(previous);
        delete previous.dataset.touchPressed;
      }
      closeRef.current = button;
      if (!button) return;
      buttonsRef.current.add(button);
      if (pointerRef.current !== null) button.dataset.touchPressed = "true";
      const source = triggerRef.current?.querySelector(".mobile-menu-touch-ring");
      const ring = button.querySelector(".mobile-menu-touch-ring");
      const animation = source?.getAnimations()[0];
      if (!source || !ring || !animation || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const remaining = Number(animation.effect?.getComputedTiming().duration) - Number(animation.currentTime);
      if (remaining > 0)
        ring.animate([{ opacity: getComputedStyle(source).opacity }, { opacity: 0 }], {
          duration: remaining,
          easing: "linear",
        });
    },
    [closeRef, triggerRef],
  );
  const onPointerDown: PointerEventHandler<HTMLButtonElement> = (event) => {
    if (event.pointerType !== "touch" || !event.isPrimary || pointerRef.current !== null) return;
    pointerRef.current = event.pointerId;
    for (const button of [triggerRef.current, closeRef.current]) {
      if (!button) continue;
      buttonsRef.current.add(button);
      const ring = button.querySelector(".mobile-menu-touch-ring");
      ring?.getAnimations().forEach((animation) => animation.cancel());
      button.dataset.touchPressed = "true";
    }
  };
  const release: PointerEventHandler<HTMLButtonElement> = (event) => {
    if (pointerRef.current !== event.pointerId) return;
    pointerRef.current = null;
    for (const button of [triggerRef.current, closeRef.current]) {
      if (!button) continue;
      delete button.dataset.touchPressed;
      const ring = button.querySelector(".mobile-menu-touch-ring");
      if (!ring || window.matchMedia("(prefers-reduced-motion: reduce)").matches) continue;
      const token = getComputedStyle(button).getPropertyValue("--motion-duration-medium").trim();
      const duration = Number.parseFloat(token) * (token.endsWith("ms") ? 1 : 1000);
      // Explicit keyframes keep a quick tap visible even when down/up occur before a paint.
      ring.animate([{ opacity: 1 }, { opacity: 0 }], { duration, easing: "linear" });
    }
  };
  useEffect(() => {
    const buttons = buttonsRef.current;
    if (triggerRef.current) buttons.add(triggerRef.current);
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const cancelRings = () => {
      for (const button of buttons) {
        button
          ?.querySelector(".mobile-menu-touch-ring")
          ?.getAnimations()
          .forEach((animation) => animation.cancel());
      }
    };
    const onMotionChange = () => {
      if (motion.matches) cancelRings();
    };
    motion.addEventListener("change", onMotionChange);
    return () => {
      motion.removeEventListener("change", onMotionChange);
      cancelRings();
      for (const button of buttons) if (button) delete button.dataset.touchPressed;
      pointerRef.current = null;
    };
  }, [triggerRef, closeRef]);
  return { attachClose, onPointerDown, onPointerUp: release, onPointerCancel: release, onLostPointerCapture: release };
}

// Keep in sync with the nav-compact variant in globals.css.
const compactNavigationQuery = "(max-width: 1150px)";

function animateMenuDismissal(
  content: HTMLElement,
  closeButton: HTMLButtonElement | null,
  trigger: HTMLButtonElement | null,
  startingTransform: string,
) {
  const style = getComputedStyle(content);
  const duration = style.getPropertyValue("--motion-duration-slow").trim();
  const panelDuration = Number.parseFloat(duration) * (duration.endsWith("ms") ? 1 : 1000);
  const feedbackToken = style.getPropertyValue("--motion-duration-fast").trim();
  const feedbackDuration = Number.parseFloat(feedbackToken) * (feedbackToken.endsWith("ms") ? 1 : 1000);
  const iconToken = style.getPropertyValue("--motion-duration-medium").trim();
  const iconDuration = Number.parseFloat(iconToken) * (iconToken.endsWith("ms") ? 1 : 1000);
  const supportingAnimations: Animation[] = [];
  const closeIcon = closeButton?.querySelector<SVGElement>(".mobile-menu-close-icon");
  const returnIcon = closeButton?.querySelector<SVGElement>(".mobile-menu-return-icon");
  const closeIconTransform = closeIcon ? getComputedStyle(closeIcon).transform : "none";
  const iconAnimation = closeIcon?.animate(
    [
      { transform: closeIconTransform, opacity: 1, offset: 0 },
      { opacity: 1, offset: 0.35 },
      { transform: "rotate(-90deg)", opacity: 0, offset: 0.75 },
      { transform: "rotate(-90deg)", opacity: 0, offset: 1 },
    ],
    { duration: iconDuration, easing: "linear", fill: "forwards" },
  );
  if (iconAnimation) supportingAnimations.push(iconAnimation);
  if (returnIcon) {
    supportingAnimations.push(
      returnIcon.animate(
        [
          { transform: "rotate(90deg) scale(0.85)", opacity: 0, offset: 0 },
          { transform: "rotate(90deg) scale(0.85)", opacity: 0, offset: 0.4 },
          { transform: "none", opacity: 1, offset: 0.9 },
          { transform: "none", opacity: 1, offset: 1 },
        ],
        {
          duration: iconDuration,
          easing: "linear",
          fill: "forwards",
        },
      ),
    );
  }
  if (closeButton && trigger) {
    const sourceStyle = getComputedStyle(closeButton);
    const source = {
      backgroundColor: sourceStyle.backgroundColor,
      borderColor: sourceStyle.borderColor,
      color: sourceStyle.color,
      outlineColor: sourceStyle.outlineColor,
      transform: sourceStyle.transform,
    };
    const target = getComputedStyle(trigger);
    // WAAPI owns these properties during dismissal; stop the press transitions first.
    closeButton.dataset.animationPhase = "closing";
    supportingAnimations.push(
      closeButton.animate(
        [
          {
            backgroundColor: source.backgroundColor,
            borderColor: source.borderColor,
            color: source.color,
            outlineColor: source.outlineColor,
            transform: source.transform,
          },
          {
            backgroundColor: target.backgroundColor,
            borderColor: target.borderColor,
            color: target.color,
            outlineColor: closeButton.matches(":focus-visible") ? source.outlineColor : "transparent",
            transform: target.transform,
          },
        ],
        {
          duration: iconDuration,
          easing: style.getPropertyValue("--motion-ease-standard").trim(),
          fill: "forwards",
        },
      ),
    );
  }
  const panelAnimation = content.animate([{ transform: startingTransform }, { transform: "translate3d(100%, 0, 0)" }], {
    duration: panelDuration,
    easing: style.getPropertyValue("--motion-ease-exit").trim(),
    fill: "forwards",
  });
  for (const element of [content.querySelector("nav"), content.querySelector(".mobile-language-links")]) {
    if (!(element instanceof HTMLElement)) continue;
    supportingAnimations.push(
      element.animate([{ opacity: getComputedStyle(element).opacity }, { opacity: 0 }], {
        duration: feedbackDuration,
        easing: style.getPropertyValue("--motion-ease-standard").trim(),
        fill: "forwards",
      }),
    );
  }
  const topBar = content.previousElementSibling;
  if (topBar instanceof HTMLElement) {
    supportingAnimations.push(
      topBar.animate(
        [
          { opacity: 1, offset: 0 },
          { opacity: 1, offset: 0.55 },
          { opacity: 0, offset: 1 },
        ],
        {
          duration: panelDuration,
          fill: "forwards",
        },
      ),
    );
  }
  return { panelAnimation, supportingAnimations };
}

export function useMobileMenu() {
  type MenuPhase = "closed" | "opening" | "open" | "closing";
  const [phase, setPhase] = useState<MenuPhase>("closed");
  const phaseRef = useRef<MenuPhase>("closed");
  const changePhase = useCallback((next: MenuPhase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);
  const isOpen = phase !== "closed";
  const triggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const pointerStartRef = useRef<{ id: number; x: number; y: number } | null>(null);
  const [contentNode, setContentNode] = useState<HTMLDivElement | null>(null);
  const attachContent = useCallback((node: HTMLDivElement | null) => {
    contentRef.current = node;
    setContentNode(node);
  }, []);
  const openingAnimationRef = useRef<Animation | null>(null);
  const openingIconAnimationRef = useRef<Animation | null>(null);
  const closingAnimationRef = useRef<Animation | null>(null);
  const closingSupportingAnimationsRef = useRef<Animation[]>([]);
  const openingStartRef = useRef<{ panel: string; icon: string; opacity: string } | null>(null);

  const closeImmediately = useCallback(() => {
    openingAnimationRef.current?.cancel();
    openingAnimationRef.current = null;
    openingIconAnimationRef.current?.cancel();
    openingIconAnimationRef.current = null;
    openingStartRef.current = null;
    pointerStartRef.current = null;
    changePhase("closed");
  }, [changePhase]);

  useLayoutEffect(() => {
    if (phase !== "opening") return;
    const content = contentRef.current;
    if (!content) return;
    const style = getComputedStyle(content);
    const token = style.getPropertyValue("--motion-duration-slow").trim();
    const duration = Number.parseFloat(token) * (token.endsWith("ms") ? 1 : 1000);
    const start = openingStartRef.current;
    openingStartRef.current = null;
    const animation = content.animate(
      [{ transform: start?.panel ?? "translate3d(100%, 0, 0)" }, { transform: "translate3d(0, 0, 0)" }],
      { duration, easing: style.getPropertyValue("--motion-ease-emphasized").trim(), fill: "backwards" },
    );
    openingAnimationRef.current = animation;
    const icon = closeButtonRef.current?.querySelector(".mobile-menu-close-icon");
    if (icon) {
      const iconToken = style.getPropertyValue("--motion-duration-medium").trim();
      const iconDuration = Number.parseFloat(iconToken) * (iconToken.endsWith("ms") ? 1 : 1000);
      const iconAnimation = icon.animate(
        [
          { transform: start?.icon ?? "rotate(-90deg)", opacity: start?.opacity ?? "1" },
          { transform: "rotate(0)", opacity: 1 },
        ],
        {
          duration: iconDuration,
          easing: style.getPropertyValue("--motion-ease-emphasized").trim(),
          fill: "backwards",
        },
      );
      openingIconAnimationRef.current = iconAnimation;
      iconAnimation.onfinish = () => {
        if (openingIconAnimationRef.current !== iconAnimation) return;
        openingIconAnimationRef.current = null;
        iconAnimation.cancel();
      };
    }
    animation.onfinish = () => {
      if (openingAnimationRef.current !== animation) return;
      openingAnimationRef.current = null;
      animation.cancel();
      openingIconAnimationRef.current?.cancel();
      openingIconAnimationRef.current = null;
      changePhase("open");
    };
    return () => {
      if (openingAnimationRef.current !== animation) return;
      openingAnimationRef.current = null;
      animation.cancel();
      openingIconAnimationRef.current?.cancel();
      openingIconAnimationRef.current = null;
    };
  }, [phase, changePhase, contentNode]);

  // Keep the final frame until the portal content unmounts; cancelling first can flash it open.
  useLayoutEffect(() => {
    if (isOpen || contentNode) return;
    closingAnimationRef.current?.cancel();
    closingAnimationRef.current = null;
    for (const animation of closingSupportingAnimationsRef.current) animation.cancel();
    closingSupportingAnimationsRef.current = [];
    closeButtonRef.current?.removeAttribute("data-animation-phase");
  }, [isOpen, contentNode]);

  const close = useCallback(() => {
    if (phaseRef.current === "closed" || phaseRef.current === "closing") return;
    const content = contentRef.current;
    if (!content || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      closeImmediately();
      return;
    }
    const startingTransform = getComputedStyle(content).transform;
    changePhase("closing");
    openingAnimationRef.current?.cancel();
    openingAnimationRef.current = null;
    const { panelAnimation, supportingAnimations } = animateMenuDismissal(
      content,
      closeButtonRef.current,
      triggerRef.current,
      startingTransform,
    );
    closingAnimationRef.current = panelAnimation;
    closingSupportingAnimationsRef.current = supportingAnimations;
    openingIconAnimationRef.current?.cancel();
    openingIconAnimationRef.current = null;
    panelAnimation.onfinish = closeImmediately;
  }, [closeImmediately, changePhase]);

  useEffect(() => {
    const compactNavigation = window.matchMedia(compactNavigationQuery);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleBreakpoint = () => {
      if (!compactNavigation.matches) closeImmediately();
    };
    const handleMotion = () => {
      if (reducedMotion.matches && phaseRef.current === "closing") closeImmediately();
      if (reducedMotion.matches) {
        openingAnimationRef.current?.cancel();
        openingAnimationRef.current = null;
        openingIconAnimationRef.current?.cancel();
        openingIconAnimationRef.current = null;
        if (phaseRef.current === "opening") changePhase("open");
      }
    };
    compactNavigation.addEventListener("change", handleBreakpoint);
    reducedMotion.addEventListener("change", handleMotion);
    return () => {
      compactNavigation.removeEventListener("change", handleBreakpoint);
      reducedMotion.removeEventListener("change", handleMotion);
      openingAnimationRef.current?.cancel();
      openingIconAnimationRef.current?.cancel();
      closingAnimationRef.current?.cancel();
      for (const animation of closingSupportingAnimationsRef.current) animation.cancel();
    };
  }, [close, closeImmediately, changePhase]);

  const handlePointerDown: PointerEventHandler<HTMLElement> = (event) => {
    if (event.pointerType !== "touch") return;
    if (!event.isPrimary) {
      pointerStartRef.current = null;
      return;
    }
    pointerStartRef.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
  };

  const handlePointerUp: PointerEventHandler<HTMLElement> = (event) => {
    const start = pointerStartRef.current;
    pointerStartRef.current = null;
    if (!start || event.pointerType !== "touch" || event.pointerId !== start.id || !event.isPrimary) return;
    const horizontalDistance = event.clientX - start.x;
    const verticalDistance = Math.abs(event.clientY - start.y);
    if (horizontalDistance >= 72 && horizontalDistance > verticalDistance * 1.2) close();
  };

  const handlePointerCancel: PointerEventHandler<HTMLElement> = () => {
    pointerStartRef.current = null;
  };

  return {
    close,
    closeImmediately,
    closeButtonRef,
    attachContent,
    drawerRef,
    handlePointerCancel,
    handlePointerDown,
    handlePointerUp,
    isOpen,
    phase,
    open: () => {
      if (
        !window.matchMedia(compactNavigationQuery).matches ||
        phaseRef.current === "open" ||
        phaseRef.current === "opening"
      )
        return;
      if (phaseRef.current === "closing" && contentRef.current) {
        const icon = closeButtonRef.current?.querySelector(".mobile-menu-close-icon");
        const iconStyle = icon ? getComputedStyle(icon) : null;
        openingStartRef.current = {
          panel: getComputedStyle(contentRef.current).transform,
          icon: iconStyle?.transform ?? "none",
          opacity: iconStyle?.opacity ?? "1",
        };
        closingAnimationRef.current?.cancel();
        closingAnimationRef.current = null;
        for (const animation of closingSupportingAnimationsRef.current) animation.cancel();
        closingSupportingAnimationsRef.current = [];
        closeButtonRef.current?.removeAttribute("data-animation-phase");
      }
      changePhase(window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "open" : "opening");
    },
    triggerRef,
  };
}
