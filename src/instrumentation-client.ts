import * as Sentry from "@sentry/nextjs";
import { createSentryOptions } from "@/lib/sentry-options";

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init(
    createSentryOptions(process.env.NEXT_PUBLIC_SENTRY_DSN, process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV),
  );
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
