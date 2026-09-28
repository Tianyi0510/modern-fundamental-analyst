"use client";

import { useState } from "react";

type ExclusiveRunner = (operation: () => Promise<void>) => Promise<boolean>;

export function createExclusiveRunner(): ExclusiveRunner {
  let inFlight = false;

  return async (operation) => {
    if (inFlight) return false;
    inFlight = true;
    try {
      await operation();
      return true;
    } finally {
      inFlight = false;
    }
  };
}

export function useExclusiveSubmit() {
  const [runner] = useState<ExclusiveRunner>(() => createExclusiveRunner());
  return runner;
}
