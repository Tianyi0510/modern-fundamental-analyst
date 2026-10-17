"use client";

import { useEffect } from "react";
import { reportClientError } from "@/lib/sentry-client";

export function useReportError(error: Error) {
  useEffect(() => {
    reportClientError(error);
  }, [error]);
}
