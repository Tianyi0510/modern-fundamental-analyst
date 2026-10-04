import "server-only";
import { captureException } from "@sentry/core";

type ServiceOperation = "stripe.checkout.create" | "contact.delivery" | "resend.request";
type FailureKind = "provider-error" | "exception" | "configuration";

export function reportServiceFailure(operation: ServiceOperation, failureKind: FailureKind) {
  // Share the client initialized by Next.js. Never attach a provider error or request payload.
  captureException(new Error(`${operation} failed`), {
    tags: { operation, failure_kind: failureKind },
  });
}
