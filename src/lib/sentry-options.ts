import type { ErrorEvent, init } from "@sentry/nextjs";

export function resolveSentryDsn(serverDsn?: string, publicDsn?: string) {
  return serverDsn?.trim() || publicDsn?.trim() || undefined;
}

function redactMessage(value: string) {
  return value
    .replace(/https?:\/\/[^\s<>"']+/gi, (url) => url.split(/[?#]/)[0] ?? "[URL]")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[Email]")
    .replace(/\bBearer\s+\S+/gi, "Bearer [Filtered]");
}

export function sanitizeSentryEvent(event: ErrorEvent): ErrorEvent {
  // Tokens and checkout recovery values travel in URLs. Do not attach form or provider payloads.
  delete event.user;
  delete event.extra;
  delete event.breadcrumbs;
  if (event.request) {
    event.request = {
      method: event.request.method,
      url: event.request.url?.split(/[?#]/)[0],
    };
  }
  if (event.message) event.message = redactMessage(event.message);
  for (const exception of event.exception?.values ?? []) {
    if (exception.value) exception.value = redactMessage(exception.value);
    for (const frame of exception.stacktrace?.frames ?? []) {
      if (frame.filename) frame.filename = frame.filename.split(/[?#]/)[0];
      if (frame.abs_path) frame.abs_path = frame.abs_path.split(/[?#]/)[0];
      delete frame.vars;
    }
  }
  return event;
}

export function createSentryOptions(dsn: string, environment: string): Parameters<typeof init>[0] {
  return {
    dsn,
    environment,
    sampleRate: 1,
    // Error monitoring only. Do not enable tracing, replay, logs or metrics.
    beforeSendLog: () => null,
    beforeSendMetric: () => null,
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: false,
      httpBodies: [],
      urlQueryParams: false,
      databaseQueryData: false,
      stackFrameVariables: false,
      frameContextLines: 0,
    },
    beforeSend: sanitizeSentryEvent,
  };
}
