import * as Sentry from "@sentry/nextjs";
import { createSentryOptions, resolveSentryDsn } from "@/lib/sentry-options";

import { canRecordReplay, createReplayOptions } from "@/lib/sentry-replay";

const dsn = resolveSentryDsn(undefined, process.env.NEXT_PUBLIC_SENTRY_DSN);
if (dsn) {
  const environment = process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV;
  Sentry.init({
    ...createSentryOptions(dsn, environment),
    integrations: canRecordReplay(window.location.href)
      ? [Sentry.replayIntegration(createReplayOptions(environment))]
      : [],
    replaysSessionSampleRate: environment === "test" ? 1 : 0.1,
    replaysOnErrorSampleRate: 1,
  });
  // Stop before recording recovery links or entering pages with private state.
  window.addEventListener("popstate", () => {
    if (!canRecordReplay(window.location.href)) void Sentry.getReplay()?.stop();
  });
  window.addEventListener("hashchange", () => {
    if (!canRecordReplay(window.location.href)) void Sentry.getReplay()?.stop();
  });
}

export const onRouterTransitionStart: typeof Sentry.captureRouterTransitionStart = (...args) => {
  if (!canRecordReplay(args[0])) void Sentry.getReplay()?.stop();
  Sentry.captureRouterTransitionStart(...args);
};
