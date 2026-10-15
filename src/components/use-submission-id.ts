"use client";

import { useRef } from "react";

export function useSubmissionId(restoreId?: () => string | undefined) {
  const submissionId = useRef<string | null>(null);

  return {
    getSubmissionId: () => {
      submissionId.current ??= restoreId?.() ?? crypto.randomUUID();
      return submissionId.current;
    },
    resetSubmissionId: () => {
      submissionId.current = null;
    },
  };
}
