import * as Sentry from "@sentry/nextjs";
import { resolveServerSentryDsn } from "@/lib/sentry-options";

export async function register() {
  if (!resolveServerSentryDsn()) return;
  if (process.env.NEXT_RUNTIME === "nodejs") await import("./sentry.server.config");
  if (process.env.NEXT_RUNTIME === "edge") await import("./sentry.edge.config");
}

export const onRequestError = Sentry.captureRequestError;
