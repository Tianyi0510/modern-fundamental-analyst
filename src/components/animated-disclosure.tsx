"use client";

import { useCallback, useEffect, useRef, type MouseEvent, type ReactNode } from "react";

import { animateSpringValue, animationVelocity } from "@/lib/motion";

export function AnimatedDisclosure({
  summary,
  children,
  className,
}: {
  summary: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDetailsElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const phaseRef = useRef<"closed" | "opening" | "open" | "closing">("closed");

  const settle = useCallback(() => {
    const details = ref.current;
    const animation = animationRef.current;
    if (!details) return;
    const summary = details.querySelector("summary");
    const open = phaseRef.current === "opening" || phaseRef.current === "open";
    if (!open && details.contains(document.activeElement) && !summary?.contains(document.activeElement)) {
      summary?.focus({ preventScroll: true });
    }
    details.open = open;
    phaseRef.current = open ? "open" : "closed";
    details.dataset.state = phaseRef.current;
    summary?.setAttribute("aria-expanded", String(open));
    if (contentRef.current) contentRef.current.inert = !open;
    details.removeAttribute("data-closing");
    animationRef.current = null;
    animation?.cancel();
  }, []);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finish = () => {
      if (motion.matches && animationRef.current) settle();
    };
    const finishOnResize = () => {
      if (animationRef.current) settle();
    };
    motion.addEventListener("change", finish);
    // Let the new layout choose its natural height instead of keeping a stale pixel target.
    window.addEventListener("resize", finishOnResize);
    return () => {
      motion.removeEventListener("change", finish);
      window.removeEventListener("resize", finishOnResize);
      animationRef.current?.cancel();
      animationRef.current = null;
    };
  }, [settle]);

  const toggle = (event: MouseEvent<HTMLElement>) => {
    const details = ref.current;
    if (!details) return;
    const summary = event.currentTarget;
    event.preventDefault();
    const startHeight = details.getBoundingClientRect().height;
    const styles = getComputedStyle(details);
    const borderHeight = parseFloat(styles.borderTopWidth) + parseFloat(styles.borderBottomWidth);
    const minimumHeight = summary.offsetHeight + borderHeight;
    // A clamped summary is stationary even while the virtual spring overshoots below it.
    const velocity = startHeight <= minimumHeight + 0.02 ? 0 : animationVelocity(animationRef.current);
    const open = animationRef.current ? phaseRef.current === "closing" : !details.open;
    phaseRef.current = open ? "opening" : "closing";
    details.dataset.state = phaseRef.current;
    summary.setAttribute("aria-expanded", String(open));
    if (!open && contentRef.current?.contains(document.activeElement)) summary.focus({ preventScroll: true });
    if (contentRef.current) contentRef.current.inert = !open;
    animationRef.current?.cancel();
    animationRef.current = null;
    details.removeAttribute("data-closing");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      settle();
      return;
    }

    details.open = true;
    details.toggleAttribute("data-closing", !open);
    const endHeight = open ? details.getBoundingClientRect().height : minimumHeight;
    const animation = animateSpringValue(
      details,
      startHeight,
      endHeight,
      (height) => ({ height: `${Math.max(minimumHeight, height)}px`, overflow: "clip" }),
      "spatialDefault",
      velocity,
    );
    animationRef.current = animation;
    animation.onfinish = () => {
      if (animationRef.current !== animation) return;
      settle();
    };
  };

  return (
    <details ref={ref} className={className}>
      <summary onClick={toggle}>{summary}</summary>
      <div ref={contentRef}>{children}</div>
    </details>
  );
}
