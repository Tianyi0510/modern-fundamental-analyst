import * as Sentry from "@sentry/nextjs";
import { createSentryOptions, resolveSentryDsn } from "@/lib/sentry-options";

const dsn = resolveSentryDsn(process.env.SENTRY_DSN, process.env.NEXT_PUBLIC_SENTRY_DSN, process.env.SENTRY_DISABLED);
if (dsn) Sentry.init(createSentryOptions(dsn, process.env.VERCEL_ENV ?? process.env.NODE_ENV));
