"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEventHandler } from "react";

import { animateSpringValue, animationVelocity, springTiming } from "@/lib/motion";

// Keep in sync with the nav-compact variant in globals.css.
const compactNavigationQuery = "(max-width: 1150px)";

function translation(element: Element) {
  const transform = getComputedStyle(element).transform;
  return transform === "none" ? 0 : new DOMMatrixReadOnly(transform).m41;
}
function rotation(element: Element) {
  const transform = getComputedStyle(element).transform;
  if (transform === "none") return 0;
  const matrix = new DOMMatrixReadOnly(transform);
  return Math.atan2(matrix.b, matrix.a) * (180 / Math.PI);
}

function animateMenuDismissal(
  content: HTMLElement,
  closeButton: HTMLButtonElement | null,
  trigger: HTMLButtonElement | null,
  startingX: number,
  velocity: number,
  iconVelocity: number,
) {
  const supportingAnimations: Animation[] = [];
  const closeIcon = closeButton?.querySelector<SVGElement>(".mobile-menu-close-icon");
  const returnIcon = closeButton?.querySelector<SVGElement>(".mobile-menu-return-icon");
  const effects = springTiming("effectsDefault");
  if (closeIcon) {
    supportingAnimations.push(
      animateSpringValue(
        closeIcon,
        rotation(closeIcon),
        -90,
        (angle) => ({ transform: `rotate(${angle}deg)` }),
        "spatialFast",
        iconVelocity,
      ),
      closeIcon.animate([{ opacity: getComputedStyle(closeIcon).opacity }, { opacity: 0 }], {
        ...effects,
        fill: "forwards",
      }),
    );
  }
  if (returnIcon) {
    supportingAnimations.push(
      animateSpringValue(
        returnIcon,
        0,
        1,
        (progress) => ({ transform: `rotate(${90 * (1 - progress)}deg) scale(${0.85 + 0.15 * progress})` }),
        "spatialFast",
      ),
      returnIcon.animate([{ opacity: 0 }, { opacity: 1 }], {
        ...effects,
        delay: springTiming("effectsFast").duration / 4,
        fill: "both",
      }),
    );
  }
  if (closeButton && trigger) {
    const source = getComputedStyle(closeButton);
    const target = getComputedStyle(trigger);
    const from = {
      backgroundColor: source.backgroundColor,
      borderColor: source.borderColor,
      color: source.color,
      outlineColor: source.outlineColor,
    };
    const to = {
      backgroundColor: target.backgroundColor,
      borderColor: target.borderColor,
      color: target.color,
      outlineColor: closeButton.matches(":focus-visible") ? source.outlineColor : "transparent",
    };
    const fromTransform = source.transform;
    const toTransform = target.transform;
    // WAAPI owns these properties during dismissal; stop competing press transitions.
    closeButton.dataset.animationPhase = "closing";
    supportingAnimations.push(
      closeButton.animate([from, to], { ...effects, fill: "forwards" }),
      closeButton.animate([{ transform: fromTransform }, { transform: toTransform }], {
        ...springTiming("spatialFast"),
        fill: "forwards",
      }),
    );
  }
  const panelAnimation = animateSpringValue(
    content,
    startingX,
    content.getBoundingClientRect().width,
    (x) => ({ transform: `translate3d(${x}px, 0, 0)` }),
    "spatialSlow",
    velocity,
  );
  for (const element of [content.querySelector("nav"), content.querySelector(".mobile-language-links")]) {
    if (!(element instanceof HTMLElement)) continue;
    supportingAnimations.push(
      element.animate([{ opacity: getComputedStyle(element).opacity }, { opacity: 0 }], {
        ...springTiming("effectsFast"),
        fill: "forwards",
      }),
    );
  }
  const topBar = content.previousElementSibling;
  if (topBar instanceof HTMLElement) {
    supportingAnimations.push(
      topBar.animate([{ opacity: 1 }, { opacity: 0 }], {
        ...effects,
        delay: Math.max(0, Number(panelAnimation.effect?.getTiming().duration) - effects.duration),
        fill: "forwards",
      }),
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
  const openingOpacityAnimationRef = useRef<Animation | null>(null);
  const closingAnimationRef = useRef<Animation | null>(null);
  const closingSupportingAnimationsRef = useRef<Animation[]>([]);
  const openingStartRef = useRef<{
    panel: number;
    panelVelocity: number;
    icon: number;
    iconVelocity: number;
    opacity: string;
  } | null>(null);

  const closeImmediately = useCallback(() => {
    openingAnimationRef.current?.cancel();
    openingAnimationRef.current = null;
    openingIconAnimationRef.current?.cancel();
    openingOpacityAnimationRef.current?.cancel();
    openingIconAnimationRef.current = null;
    openingStartRef.current = null;
    pointerStartRef.current = null;
    changePhase("closed");
  }, [changePhase]);

  useLayoutEffect(() => {
    if (phase !== "opening") return;
    const content = contentRef.current;
    if (!content) return;
    const start = openingStartRef.current;
    openingStartRef.current = null;
    const animation = animateSpringValue(
      content,
      start?.panel ?? content.getBoundingClientRect().width,
      0,
      (x) => ({ transform: `translate3d(${Math.max(0, x)}px, 0, 0)` }),
      "spatialSlow",
      start?.panelVelocity ?? 0,
      "backwards",
    );
    openingAnimationRef.current = animation;
    const icon = closeButtonRef.current?.querySelector(".mobile-menu-close-icon");
    if (icon) {
      const iconAnimation = animateSpringValue(
        icon,
        start?.icon ?? -90,
        0,
        (angle) => ({ transform: `rotate(${angle}deg)` }),
        "spatialFast",
        start?.iconVelocity ?? 0,
        "backwards",
      );
      openingOpacityAnimationRef.current = icon.animate([{ opacity: start?.opacity ?? "1" }, { opacity: 1 }], {
        ...springTiming("effectsDefault"),
        fill: "backwards",
      });
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
      openingOpacityAnimationRef.current?.cancel();
      openingIconAnimationRef.current = null;
      changePhase("open");
    };
    return () => {
      if (openingAnimationRef.current !== animation) return;
      openingAnimationRef.current = null;
      animation.cancel();
      openingIconAnimationRef.current?.cancel();
      openingOpacityAnimationRef.current?.cancel();
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
    const startingX = translation(content);
    const velocity = startingX <= 0 ? 0 : animationVelocity(openingAnimationRef.current);
    const iconVelocity = animationVelocity(openingIconAnimationRef.current);
    // Keep focus on the remaining control before navigation becomes inert.
    closeButtonRef.current?.focus({ preventScroll: true });
    changePhase("closing");
    openingAnimationRef.current?.cancel();
    openingAnimationRef.current = null;
    const { panelAnimation, supportingAnimations } = animateMenuDismissal(
      content,
      closeButtonRef.current,
      triggerRef.current,
      startingX,
      velocity,
      iconVelocity,
    );
    closingAnimationRef.current = panelAnimation;
    closingSupportingAnimationsRef.current = supportingAnimations;
    openingIconAnimationRef.current?.cancel();
    openingOpacityAnimationRef.current?.cancel();
    openingIconAnimationRef.current = null;
    panelAnimation.onfinish = closeImmediately;
  }, [closeImmediately, changePhase]);

  useEffect(() => {
    const compactNavigation = window.matchMedia(compactNavigationQuery);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = window.innerWidth;
    const handleResize = () => {
      if (window.innerWidth === width) return;
      width = window.innerWidth;
      if (phaseRef.current === "closing") closeImmediately();
      else if (phaseRef.current === "opening") {
        openingAnimationRef.current?.cancel();
        openingAnimationRef.current = null;
        openingIconAnimationRef.current?.cancel();
        openingIconAnimationRef.current = null;
        openingOpacityAnimationRef.current?.cancel();
        changePhase("open");
      }
    };
    const handleBreakpoint = () => {
      if (!compactNavigation.matches) closeImmediately();
    };
    const handleMotion = () => {
      if (reducedMotion.matches && phaseRef.current === "closing") closeImmediately();
      if (reducedMotion.matches) {
        openingAnimationRef.current?.cancel();
        openingAnimationRef.current = null;
        openingIconAnimationRef.current?.cancel();
        openingOpacityAnimationRef.current?.cancel();
        openingIconAnimationRef.current = null;
        if (phaseRef.current === "opening") changePhase("open");
      }
    };
    window.addEventListener("resize", handleResize);
    compactNavigation.addEventListener("change", handleBreakpoint);
    reducedMotion.addEventListener("change", handleMotion);
    return () => {
      window.removeEventListener("resize", handleResize);
      compactNavigation.removeEventListener("change", handleBreakpoint);
      reducedMotion.removeEventListener("change", handleMotion);
      openingAnimationRef.current?.cancel();
      openingIconAnimationRef.current?.cancel();
      openingOpacityAnimationRef.current?.cancel();
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
          panel: translation(contentRef.current),
          panelVelocity: animationVelocity(closingAnimationRef.current),
          icon: icon ? rotation(icon) : 0,
          iconVelocity: animationVelocity(closingSupportingAnimationsRef.current[0] ?? null),
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
