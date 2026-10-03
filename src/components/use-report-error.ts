"use client";

import { useEffect } from "react";
import { captureException } from "@sentry/nextjs";

export function useReportError(error: Error) {
  useEffect(() => {
    captureException(error);
  }, [error]);
}
