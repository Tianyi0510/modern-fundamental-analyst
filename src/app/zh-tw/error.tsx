"use client";

import { PageError } from "@/components/page-error";
import { useReportError } from "@/components/use-report-error";

export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useReportError(error);
  return <PageError locale="zh-tw" retry={retry} />;
}
