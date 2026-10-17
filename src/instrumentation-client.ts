import { getSentryClient, startSentryClient } from "@/lib/sentry-client";
import type { captureRouterTransitionStart } from "@sentry/nextjs";
import { createSentryOptions, resolveSentryDsn } from "@/lib/sentry-options";

import { canRecordReplay } from "@/lib/sentry-replay";
import { yieldToMain } from "@/lib/yield-to-main";

let replayAllowed = false;
function stopPrivateReplay(href: string) {
  if (!canRecordReplay(href)) {
    replayAllowed = false;
    void getSentryClient()?.getReplay()?.stop();
  }
}

let startup: ReturnType<typeof startSentryClient> | undefined;
const dsn = resolveSentryDsn(undefined, process.env.NEXT_PUBLIC_SENTRY_DSN);
if (dsn) {
  const environment = process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV;
  startup = startSentryClient({
    ...createSentryOptions(dsn, environment),
    integrations: [],
    replaysSessionSampleRate: environment === "test" ? 1 : 0.1,
    replaysOnErrorSampleRate: 1,
  });
  replayAllowed = canRecordReplay(window.location.href);
  if (replayAllowed) {
    // Load the DOM recorder separately so error monitoring does not block on Replay code.
    void startup
      .then(async (sdk) => {
        if (!sdk) return null;
        await yieldToMain();
        return replayAllowed && canRecordReplay(window.location.href) ? import("@/lib/sentry-replay-client") : null;
      })
      .then(async (replay) => {
        if (!replay) return;
        // Module evaluation and the initial DOM snapshot must not share one task.
        await yieldToMain();
        if (replayAllowed && canRecordReplay(window.location.href)) replay.initializeReplay();
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

export const onRouterTransitionStart: typeof captureRouterTransitionStart = (...args) => {
  stopPrivateReplay(args[0]);
  const client = getSentryClient();
  if (client) client.captureRouterTransitionStart(...args);
  else void startup?.then((sdk) => sdk?.captureRouterTransitionStart(...args));
};
