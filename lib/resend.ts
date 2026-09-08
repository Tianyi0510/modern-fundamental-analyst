import "server-only";
import { Resend } from "resend";
import { AsyncLocalStorage } from "node:async_hooks";

export const resendOperationContext = new AsyncLocalStorage<{ signal: AbortSignal; uncertain: boolean; recordPhase?: (phase: string) => Promise<void> }>();

export function reportResendRollbackFailure() {
  const context = resendOperationContext.getStore();
  if (context) context.uncertain = true;
  console.error("Resend rollback incomplete; subscriber reconciliation required");
}

class BoundedResend extends Resend {
  override async fetchRequest<T>(path: string, options: RequestInit = {}) {
    const context = resendOperationContext.getStore();
    if (context?.uncertain) throw new Error("Previous Resend request has an unknown outcome");
    const signals = [AbortSignal.timeout(8_000)];
    if (context) signals.push(context.signal);
    if (options.signal) signals.push(options.signal);
    const signal = AbortSignal.any(signals);
    signal.throwIfAborted();
    const result = await super.fetchRequest<T>(path, { ...options, signal });
    if (context && result.error && (result.error.statusCode == null || result.error.statusCode >= 500)) context.uncertain = true;
    // An aborted write may already have reached Resend. Keep the subscriber
    // lease until expiry rather than immediately allowing another mutation.
    if (signal.aborted) {
      if (context) context.uncertain = true;
      signal.throwIfAborted();
    }
    return result;
  }
}

export const CONTACT_FROM_EMAIL = "Modern Fundamental Analyst <contact@mail.modernfundamentalanalyst.com>";
export const UPDATES_FROM_EMAIL = "Modern Fundamental Analyst <updates@mail.modernfundamentalanalyst.com>";

const REQUEST_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function getResendIdempotencyKey(request: Request, scope: "contact" | "preferences") {
  const requestId = request.headers.get("idempotency-key")?.trim();
  return requestId && REQUEST_ID_PATTERN.test(requestId) ? `${scope}/${requestId.toLowerCase()}` : undefined;
}

type ResendState = { apiKey: string; client: Resend };
const globalForResend = globalThis as typeof globalThis & { __mfaResendState?: ResendState };

export function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (globalForResend.__mfaResendState?.apiKey !== apiKey || !(globalForResend.__mfaResendState.client instanceof BoundedResend)) {
    globalForResend.__mfaResendState = { apiKey, client: new BoundedResend(apiKey) };
  }
  return globalForResend.__mfaResendState.client;
}

export async function runResendOperation<T>(label: string, operation: () => Promise<T>): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    console.error(label, error instanceof Error ? error.name : "UnknownError");
    return null;
  }
}
