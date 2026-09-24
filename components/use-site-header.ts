"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEventHandler } from "react";

// Keep in sync with the navigation-only breakpoint in responsive.css.
const compactNavigationQuery = "(max-width: 1150px)";

function animateMenuDismissal(content: HTMLElement, icon: SVGElement | null) {
  const style = getComputedStyle(content);
  const duration = style.getPropertyValue("--motion-duration-slow").trim();
  const panelDuration = Number.parseFloat(duration) * (duration.endsWith("ms") ? 1 : 1000);
  const feedbackToken = style.getPropertyValue("--motion-duration-fast").trim();
  const feedbackDuration = Number.parseFloat(feedbackToken) * (feedbackToken.endsWith("ms") ? 1 : 1000);
  const supportingAnimations: Animation[] = [];
  const iconAnimation = icon?.animate(
    [{ transform: getComputedStyle(icon).transform }, { transform: "rotate(-90deg)" }],
    { duration: feedbackDuration, easing: style.getPropertyValue("--motion-ease-standard").trim(), fill: "forwards" },
  );
  if (iconAnimation) supportingAnimations.push(iconAnimation);
  const closeButton = icon?.closest("button");
  if (closeButton) {
    supportingAnimations.push(
      closeButton.animate(
        [
          { opacity: 1, offset: 0 },
          { opacity: 1, offset: 0.3 },
          { opacity: 0, offset: 0.55 },
          { opacity: 0, offset: 1 },
        ],
        { duration: panelDuration, fill: "forwards" },
      ),
    );
  }
  const panelAnimation = content.animate(
    [{ transform: "translate3d(0, 0, 0)" }, { transform: "translate3d(100%, 0, 0)" }],
    {
      duration: panelDuration,
      easing: style.getPropertyValue("--motion-ease-exit").trim(),
      fill: "forwards",
    },
  );
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
  const [isOpen, setIsOpen] = useState(false);
  const isOpenRef = useRef(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const pointerStartRef = useRef<{ id: number; x: number; y: number } | null>(null);
  const scrollPositionRef = useRef(0);
  const closingAnimationRef = useRef<Animation | null>(null);
  const closingSupportingAnimationsRef = useRef<Animation[]>([]);

  const closeImmediately = useCallback(() => {
    isOpenRef.current = false;
    pointerStartRef.current = null;
    setIsOpen(false);
  }, []);

  // Keep the final frame until React has hidden the layer; cancelling first can flash it open.
  useLayoutEffect(() => {
    if (isOpen) return;
    closingAnimationRef.current?.cancel();
    closingAnimationRef.current = null;
    for (const animation of closingSupportingAnimationsRef.current) animation.cancel();
    closingSupportingAnimationsRef.current = [];
  }, [isOpen]);

  const close = useCallback(() => {
    if (!isOpenRef.current || closingAnimationRef.current) return;
    const content = contentRef.current;
    if (!content || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      closeImmediately();
      return;
    }
    const { panelAnimation, supportingAnimations } = animateMenuDismissal(
      content,
      closeButtonRef.current?.querySelector("svg") ?? null,
    );
    closingAnimationRef.current = panelAnimation;
    closingSupportingAnimationsRef.current = supportingAnimations;
    panelAnimation.onfinish = closeImmediately;
  }, [closeImmediately]);

  useEffect(() => {
    const compactNavigation = window.matchMedia(compactNavigationQuery);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleBreakpoint = () => {
      if (!compactNavigation.matches) closeImmediately();
    };
    const handleMotion = () => {
      if (reducedMotion.matches && closingAnimationRef.current) closeImmediately();
    };
    // Keep dismissal independent of render timing and repeated input.
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    compactNavigation.addEventListener("change", handleBreakpoint);
    reducedMotion.addEventListener("change", handleMotion);
    window.addEventListener("keydown", handleEscape);
    return () => {
      compactNavigation.removeEventListener("change", handleBreakpoint);
      reducedMotion.removeEventListener("change", handleMotion);
      closingAnimationRef.current?.cancel();
      for (const animation of closingSupportingAnimationsRef.current) animation.cancel();
      window.removeEventListener("keydown", handleEscape);
    };
  }, [close, closeImmediately]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.documentElement.style.overflow;
    const previousBodyPosition = document.body.style.position;
    const previousBodyTop = document.body.style.top;
    const previousBodyWidth = document.body.style.width;
    const previousBodyOverflow = document.body.style.overflow;
    const scrollPosition = scrollPositionRef.current;
    const trigger = triggerRef.current;
    const layer = drawerRef.current?.parentElement;
    const wordmark = trigger?.parentElement?.querySelector(":scope > .wordmark");
    // Isolate siblings at every level without making the drawer's ancestors inert.
    const background = new Map<HTMLElement, boolean>();
    let branch: HTMLElement | null = drawerRef.current;
    while (branch && branch !== document.body) {
      for (const sibling of branch.parentElement?.children ?? []) {
        if (sibling instanceof HTMLElement && sibling !== branch) {
          // Keep the underlying header painted while the fixed layer intercepts
          // pointer input and React removes these controls from the tab order.
          if (branch === layer && (sibling === trigger || sibling === wordmark)) continue;
          background.set(sibling, sibling.inert);
          sibling.setAttribute("inert", "");
        }
      }
      branch = branch.parentElement;
    }
    const containFocus = () => {
      if (!drawerRef.current?.contains(document.activeElement)) {
        closeButtonRef.current?.focus({ preventScroll: true });
      }
    };
    const handleKeyboard = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const focusable = drawerRef.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.documentElement.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollPosition}px`;
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus({ preventScroll: true });
    window.addEventListener("keydown", handleKeyboard);
    document.addEventListener("focusin", containFocus);
    return () => {
      document.removeEventListener("focusin", containFocus);
      for (const [element, previousInert] of background) element.inert = previousInert;
      document.documentElement.style.overflow = previousOverflow;
      document.body.style.position = previousBodyPosition;
      document.body.style.top = previousBodyTop;
      document.body.style.width = previousBodyWidth;
      document.body.style.overflow = previousBodyOverflow;
      window.scrollTo({ top: scrollPosition, left: 0, behavior: "instant" });
      window.removeEventListener("keydown", handleKeyboard);
      if (trigger?.getClientRects().length) trigger.focus({ preventScroll: true });
    };
  }, [isOpen]);

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
    contentRef,
    drawerRef,
    handlePointerCancel,
    handlePointerDown,
    handlePointerUp,
    isOpen,
    open: () => {
      if (isOpenRef.current || !window.matchMedia(compactNavigationQuery).matches) return;
      isOpenRef.current = true;
      scrollPositionRef.current = window.scrollY;
      setIsOpen(true);
    },
    triggerRef,
  };
}

export function useLanguageMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const focusItem = (position: "first" | "last") => {
    requestAnimationFrame(() => {
      if (triggerRef.current?.getAttribute("aria-expanded") !== "true") return;
      const items = containerRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]');
      const index = position === "first" ? 0 : (items?.length ?? 1) - 1;
      items?.[index]?.focus({ preventScroll: true });
    });
  };

  useEffect(() => {
    if (!isOpen) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const closeOnOutsideFocus = (event: FocusEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const compactNavigation = window.matchMedia(compactNavigationQuery);
    const handleBreakpoint = () => {
      if (compactNavigation.matches) setIsOpen(false);
    };
    const handleKeyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus({ preventScroll: true });
        return;
      }
      if (!containerRef.current?.contains(document.activeElement)) return;
      if (event.key === "Tab") {
        // Resume native tab order from the trigger before hiding the focused item.
        triggerRef.current?.focus({ preventScroll: true });
        setIsOpen(false);
        if (event.shiftKey) {
          event.preventDefault();
        }
        return;
      }
      if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
      const items = Array.from(containerRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
      if (!items.length) return;
      event.preventDefault();
      const currentIndex = items.indexOf(document.activeElement as HTMLElement);
      const nextIndex =
        event.key === "Home"
          ? 0
          : event.key === "End"
            ? items.length - 1
            : event.key === "ArrowDown"
              ? (currentIndex + 1) % items.length
              : (currentIndex - 1 + items.length) % items.length;
      items[nextIndex]?.focus({ preventScroll: true });
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("focusin", closeOnOutsideFocus);
    compactNavigation.addEventListener("change", handleBreakpoint);
    window.addEventListener("keydown", handleKeyboard);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("focusin", closeOnOutsideFocus);
      compactNavigation.removeEventListener("change", handleBreakpoint);
      window.removeEventListener("keydown", handleKeyboard);
    };
  }, [isOpen]);

  return {
    close: () => setIsOpen(false),
    containerRef,
    focusItem,
    isOpen,
    open: () => setIsOpen(true),
    toggle: () => setIsOpen((current) => !current),
    triggerRef,
  };
}
