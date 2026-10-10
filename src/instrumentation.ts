import * as Sentry from "@sentry/nextjs";
import { resolveSentryDsn } from "@/lib/sentry-options";

export async function register() {
  if (!resolveSentryDsn(process.env.SENTRY_DSN, process.env.NEXT_PUBLIC_SENTRY_DSN, process.env.SENTRY_DISABLED))
    return;
  if (process.env.NEXT_RUNTIME === "nodejs") await import("./sentry.server.config");
  if (process.env.NEXT_RUNTIME === "edge") await import("./sentry.edge.config");
}

export const onRequestError = Sentry.captureRequestError;
