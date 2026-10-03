"use client";

import { useEffect } from "react";

// Delegate feedback so server-rendered controls do not need individual client boundaries.
// Clicks, focus, scrolling and form submission remain owned by the native control.
export function TouchPressFeedback() {
  useEffect(() => {
    let press: { element: HTMLElement; pointerId: number; x: number; y: number } | null = null;
    const clear = () => {
      if (press) delete press.element.dataset.touchPressed;
      press = null;
    };
    const start = (event: PointerEvent) => {
      if (event.pointerType !== "touch" || !event.isPrimary || press || !(event.target instanceof Element)) return;
      const element = event.target.closest<HTMLElement>("[data-touch-feedback]");
      if (!element || element.matches(":disabled, [aria-disabled='true']") || element.closest("[inert]")) return;
      press = { element, pointerId: event.pointerId, x: event.clientX, y: event.clientY };
      element.dataset.touchPressed = "true";
    };
    const release = (event: PointerEvent) => {
      if (press?.pointerId === event.pointerId) clear();
    };
    const move = (event: PointerEvent) => {
      if (!press || press.pointerId !== event.pointerId) return;
      const bounds = press.element.getBoundingClientRect();
      // Cancel as a gesture develops; do not re-arm until the next touch.
      if (
        Math.hypot(event.clientX - press.x, event.clientY - press.y) > 10 ||
        event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom
      )
        clear();
    };
    const options = { capture: true, passive: true };
    document.addEventListener("pointerdown", start, options);
    document.addEventListener("pointermove", move, options);
    document.addEventListener("pointerup", release, options);
    document.addEventListener("pointercancel", release, options);
    document.addEventListener("lostpointercapture", release, options);
    document.addEventListener("scroll", clear, options);
    document.addEventListener("visibilitychange", clear);
    window.addEventListener("blur", clear);
    window.addEventListener("pagehide", clear);
    return () => {
      clear();
      document.removeEventListener("pointerdown", start, true);
      document.removeEventListener("pointermove", move, true);
      document.removeEventListener("pointerup", release, true);
      document.removeEventListener("pointercancel", release, true);
      document.removeEventListener("lostpointercapture", release, true);
      document.removeEventListener("scroll", clear, true);
      document.removeEventListener("visibilitychange", clear);
      window.removeEventListener("blur", clear);
      window.removeEventListener("pagehide", clear);
    };
  }, []);
  return null;
}
