"use client";

import Link from "next/link";
import { useState, type ComponentProps } from "react";

export function IntentLink({ onMouseEnter, onFocus, onPointerDown, prefetch, ...props }: ComponentProps<typeof Link>) {
  const [active, setActive] = useState(false);
  return (
    <Link
      {...props}
      prefetch={prefetch === undefined ? (active ? null : false) : prefetch}
      onMouseEnter={(event) => {
        onMouseEnter?.(event);
        if (!event.defaultPrevented) setActive(true);
      }}
      onFocus={(event) => {
        onFocus?.(event);
        if (!event.defaultPrevented) setActive(true);
      }}
      onPointerDown={(event) => {
        onPointerDown?.(event);
        if (!event.defaultPrevented) setActive(true);
      }}
    />
  );
}
