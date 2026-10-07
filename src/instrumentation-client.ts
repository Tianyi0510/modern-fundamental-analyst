import * as Sentry from "@sentry/nextjs";
import { createSentryOptions, resolveSentryDsn } from "@/lib/sentry-options";

const dsn = resolveSentryDsn(undefined, process.env.NEXT_PUBLIC_SENTRY_DSN);
if (dsn) {
  Sentry.init(createSentryOptions(dsn, process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV));
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
