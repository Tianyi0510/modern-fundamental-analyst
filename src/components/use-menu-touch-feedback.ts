"use client";

import { useCallback, useEffect, useRef, type PointerEventHandler, type RefObject } from "react";

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
