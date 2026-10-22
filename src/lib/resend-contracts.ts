import "server-only";
import { resendOperationContext } from "./resend";
import { reportServiceFailure } from "./sentry-server";

export function hasProviderId(value: unknown): value is { id: string } {
  return Boolean(
    value && typeof value === "object" && "id" in value && typeof value.id === "string" && value.id.trim(),
  );
}

// A dispatched write without a valid acknowledgement may already have taken effect.
export function isResendWriteAcknowledged(
  value: unknown,
  validate: (value: unknown) => boolean = hasProviderId,
): boolean {
  if (validate(value)) return true;
  const context = resendOperationContext.getStore();
  if (context) context.uncertain = true;
  reportServiceFailure("resend.request", "provider-error");
  return false;
}

export function isRemovalAcknowledged(value: unknown): boolean {
  return hasProviderId(value) && "deleted" in value && value.deleted === true;
}
