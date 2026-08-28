import { Resend } from "resend";

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
  if (globalForResend.__mfaResendState?.apiKey !== apiKey) {
    globalForResend.__mfaResendState = { apiKey, client: new Resend(apiKey) };
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
