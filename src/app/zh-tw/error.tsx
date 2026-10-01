"use client";

import { PageError } from "@/components/page-error";

export default function ErrorPage({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <PageError locale="zh-tw" retry={retry} />;
}
