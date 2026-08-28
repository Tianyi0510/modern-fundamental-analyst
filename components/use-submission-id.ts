"use client";

import { useRef } from "react";

export function useSubmissionId() {
  const submissionId = useRef<string | null>(null);

  return {
    getSubmissionId() {
      submissionId.current ??= crypto.randomUUID();
      return submissionId.current;
    },
    resetSubmissionId() {
      submissionId.current = null;
    },
  };
}
