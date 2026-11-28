import * as Sentry from "@sentry/nextjs";
import { createSentryOptions, resolveServerSentryDsn } from "@/lib/sentry-options";

import { resolveSentryEnvironment } from "@/lib/sentry-dsn";

const dsn = resolveServerSentryDsn();
if (dsn) Sentry.init(createSentryOptions(dsn, resolveSentryEnvironment(process.env.VERCEL_ENV, process.env.NODE_ENV)));
