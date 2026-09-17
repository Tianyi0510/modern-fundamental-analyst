"use client";

import { useCallback, useEffect, useRef, type MouseEvent, type ReactNode } from "react";

export function AnimatedDisclosure({ summary, children, className }: { summary: ReactNode; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDetailsElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const targetOpenRef = useRef(false);

  const settle = useCallback(() => {
    const details = ref.current;
    const animation = animationRef.current;
    if (!details || !animation) return;
    const summary = details.querySelector("summary");
    if (!targetOpenRef.current && details.contains(document.activeElement) && !summary?.contains(document.activeElement)) {
      summary?.focus({ preventScroll: true });
    }
    details.open = targetOpenRef.current;
    details.removeAttribute("data-closing");
    animationRef.current = null;
    animation.cancel();
  }, []);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finish = () => { if (motion.matches) settle(); };
    motion.addEventListener("change", finish);
    // Let the new layout choose its natural height instead of keeping a stale pixel target.
    window.addEventListener("resize", settle);
    return () => {
      motion.removeEventListener("change", finish);
      window.removeEventListener("resize", settle);
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
    const open = animationRef.current ? !targetOpenRef.current : !details.open;
    targetOpenRef.current = open;
    animationRef.current?.cancel();
    animationRef.current = null;
    details.removeAttribute("data-closing");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      details.open = open;
      return;
    }

    details.open = true;
    details.toggleAttribute("data-closing", !open);
    const styles = getComputedStyle(details);
    const borderHeight = parseFloat(styles.borderTopWidth) + parseFloat(styles.borderBottomWidth);
    const endHeight = open ? details.getBoundingClientRect().height : summary.offsetHeight + borderHeight;
    const durationToken = styles.getPropertyValue("--motion-duration-slow").trim();
    const duration = parseFloat(durationToken) * (durationToken.endsWith("ms") ? 1 : 1000);
    const animation = details.animate(
      [{ height: `${startHeight}px`, overflow: "clip" }, { height: `${endHeight}px`, overflow: "clip" }],
      { duration, easing: styles.getPropertyValue("--motion-ease-emphasized").trim(), fill: "forwards" },
    );
    animationRef.current = animation;
    animation.onfinish = () => {
      if (animationRef.current !== animation) return;
      settle();
    };
  };

  return <details ref={ref} className={className}><summary onClick={toggle}>{summary}</summary>{children}</details>;
}
