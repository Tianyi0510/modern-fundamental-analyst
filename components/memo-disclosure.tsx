"use client";

import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";

export function MemoDisclosure({ summary, children }: { summary: ReactNode; children: ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const targetOpenRef = useRef(false);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finish = () => { if (motion.matches) animationRef.current?.finish(); };
    motion.addEventListener("change", finish);
    return () => {
      motion.removeEventListener("change", finish);
      const animation = animationRef.current;
      animation?.finish();
      animation?.cancel();
    };
  }, []);

  const toggle = (event: MouseEvent<HTMLElement>) => {
    const details = ref.current;
    const summary = details?.querySelector("summary");
    if (!details || !summary?.contains(event.target as Node)) return;
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
      { duration, easing: styles.getPropertyValue("--motion-ease-emphasized").trim() },
    );
    animationRef.current = animation;
    animation.onfinish = () => {
      details.open = open;
      details.removeAttribute("data-closing");
      animationRef.current = null;
    };
  };

  return <details ref={ref} className="memo-disclosure"><summary onClick={toggle}>{summary}</summary>{children}</details>;
}
