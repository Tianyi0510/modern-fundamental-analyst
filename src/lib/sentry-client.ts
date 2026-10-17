import { yieldToMain } from "./yield-to-main";

type ClientSdk = typeof import("./sentry-client-sdk");
type CaptureContext = Parameters<ClientSdk["captureException"]>[1];
let client: ClientSdk | undefined;
let startup: Promise<ClientSdk | undefined> | undefined;
let failed = false;
const pending: Array<{ error: unknown; context?: CaptureContext }> = [];
const bufferLimit = 25;

export function reportClientError(error: unknown, context?: CaptureContext): void {
  if (client) client.captureException(error, context);
  else if (startup && !failed && pending.length < bufferLimit) pending.push({ error, context });
}

export function getSentryClient() {
  return client;
}

export function startSentryClient(options: Parameters<ClientSdk["init"]>[0]) {
  if (startup) return startup;
  if (typeof window === "undefined") return Promise.resolve(undefined);
  const bufferError = (event: ErrorEvent) => {
    const error: unknown = event.error ?? event.message;
    if (error)
      reportClientError(error, { mechanism: { handled: false, type: "auto.browser.global_handlers.onerror" } });
  };
  const bufferRejection = (event: PromiseRejectionEvent) =>
    reportClientError(event.reason, {
      mechanism: { handled: false, type: "auto.browser.global_handlers.onunhandledrejection" },
    });
  const removeBuffer = () => {
    window.removeEventListener("error", bufferError);
    window.removeEventListener("unhandledrejection", bufferRejection);
  };
  // Capture from the first instrumentation turn while SDK code loads in a separate task.
  window.addEventListener("error", bufferError);
  window.addEventListener("unhandledrejection", bufferRejection);
  startup = yieldToMain()
    .then(() => import("./sentry-client-sdk"))
    .then((sdk) => {
      sdk.init(options);
      client = sdk;
      removeBuffer();
      for (const event of pending.splice(0)) sdk.captureException(event.error, event.context);
      return sdk;
    })
    .catch(() => {
      removeBuffer();
      failed = true;
      pending.length = 0;
      // Monitoring failure must not prevent the application from hydrating.
      return undefined;
    });
  return startup;
}
