"use client";

import { useReportError } from "@/components/use-report-error";

export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useReportError(error);
  return (
    <html lang="en">
      <body>
        <main id="main-content" tabIndex={-1}>
          <h1>This Page Could Not Be Loaded.</h1>
          <button type="button" onClick={retry}>
            Try Again
          </button>
          <p>
            {/* A document navigation must work even when the root router has failed. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/">Return Home</a>
          </p>
        </main>
      </body>
    </html>
  );
}
