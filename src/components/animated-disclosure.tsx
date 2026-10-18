"use client";

import { useRef, type ReactNode } from "react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "./ui/collapsible";
import styles from "./animated-disclosure.module.css";

export function AnimatedDisclosure({
  summary,
  children,
  className,
}: {
  summary: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  return (
    <Collapsible
      ref={rootRef}
      className={className}
      onOpenChange={(open) => {
        if (!open && rootRef.current?.contains(document.activeElement)) {
          triggerRef.current?.focus({ preventScroll: true });
        }
      }}
    >
      <CollapsibleTrigger ref={triggerRef}>{summary}</CollapsibleTrigger>
      <CollapsibleContent keepMounted className={styles.panel}>
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}
