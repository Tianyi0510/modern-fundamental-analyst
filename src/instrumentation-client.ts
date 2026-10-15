import * as Sentry from "@sentry/nextjs";
import { createSentryOptions, resolveSentryDsn } from "@/lib/sentry-options";

import { canRecordReplay } from "@/lib/sentry-replay";

let replayAllowed = false;
function stopPrivateReplay(href: string) {
  if (!canRecordReplay(href)) {
    replayAllowed = false;
    void Sentry.getReplay()?.stop();
  }
}

const dsn = resolveSentryDsn(undefined, process.env.NEXT_PUBLIC_SENTRY_DSN);
if (dsn) {
  const environment = process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV;
  Sentry.init({
    ...createSentryOptions(dsn, environment),
    // Locale/timezone enrichment performs a costly Intl initialization before hydration.
    integrations: (integrations) => integrations.filter((integration) => integration.name !== "CultureContext"),
    replaysSessionSampleRate: environment === "test" ? 1 : 0.1,
    replaysOnErrorSampleRate: 1,
  });
  replayAllowed = canRecordReplay(window.location.href);
  if (replayAllowed) {
    // Load the DOM recorder separately so error monitoring does not block on Replay code.
    void import("@/lib/sentry-replay-client")
      .then(async ({ initializeReplay }) => {
        // Let the browser render between loading the recorder and taking its first snapshot.
        await new Promise<void>((resolve) => setTimeout(resolve, 0));
        if (replayAllowed && canRecordReplay(window.location.href)) initializeReplay(environment);
      })
      .catch(() => {
        // Optional Replay loading must not interrupt navigation or error monitoring.
      });
  }
  // Stop before recording recovery links or entering pages with private state.
  window.addEventListener("popstate", () => {
    stopPrivateReplay(window.location.href);
  });
  window.addEventListener("hashchange", () => {
    stopPrivateReplay(window.location.href);
  });
}

export const onRouterTransitionStart: typeof Sentry.captureRouterTransitionStart = (...args) => {
  stopPrivateReplay(args[0]);
  Sentry.captureRouterTransitionStart(...args);
};
