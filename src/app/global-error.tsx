"use client";

export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="en">
      <body>
        <main id="main-content" tabIndex={-1}>
          <h1>This page could not be loaded.</h1>
          <button type="button" onClick={retry}>
            Try again
          </button>
          <p>
            {/* A document navigation must work even when the root router has failed. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/">Return home</a>
          </p>
        </main>
      </body>
    </html>
  );
}
