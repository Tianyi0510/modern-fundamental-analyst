import "server-only";
import { captureException, logger, metrics } from "@sentry/core";

type ServiceOperation = "stripe.checkout.create" | "contact.delivery" | "resend.request";
type FailureKind = "provider-error" | "exception" | "configuration";

export function reportServiceFailure(operation: ServiceOperation, failureKind: FailureKind) {
  const attributes = { operation, failure_kind: failureKind };
  // Share the client initialized by Next.js. Never attach a provider error or request payload.
  captureException(new Error(`${operation} failed`), {
    tags: attributes,
  });
  logger.error("Service operation failed", attributes);
  metrics.count("mfa.service.failures", 1, { attributes });
}
