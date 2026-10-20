"use client";

import { startTransition, useEffect, useState } from "react";

export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    // Enabling hydrated controls must not force the remaining page into synchronous hydration.
    startTransition(() => setHydrated(true));
  }, []);
  return hydrated;
}
