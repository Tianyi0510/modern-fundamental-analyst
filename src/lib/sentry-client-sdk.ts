import { init as initializeSdk } from "@sentry/nextjs";
import { createSentryOptions } from "./sentry-options";

export { captureException, captureRouterTransitionStart, getReplay } from "@sentry/nextjs";

export function init(options: Parameters<typeof initializeSdk>[0] & { dsn: string; environment: string }) {
  // Construct privacy hooks with the SDK so the bootstrap only loads its startup controls.
  return initializeSdk({ ...createSentryOptions(options.dsn, options.environment), ...options });
}
