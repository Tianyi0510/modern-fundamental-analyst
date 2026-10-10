import type { ErrorEvent, init } from "@sentry/nextjs";
import type { Log, Metric, StreamedSpanJSON } from "@sentry/core";

function serviceAttributes(attributes?: Record<string, unknown>) {
  const operation = attributes?.operation;
  const failureKind = attributes?.failure_kind;
  if (
    typeof operation !== "string" ||
    typeof failureKind !== "string" ||
    !["stripe.checkout.create", "contact.delivery", "resend.request"].includes(operation) ||
    !["provider-error", "exception", "configuration"].includes(failureKind)
  )
    return null;
  const result: Record<string, unknown> = { operation, failure_kind: failureKind };
  for (const key of ["sentry.environment", "sentry.release", "sentry.sdk.name", "sentry.sdk.version"]) {
    if (typeof attributes?.[key] === "string") result[key] = attributes[key];
  }
  return result;
}

export function sanitizeSentryLog(log: Log): Log | null {
  const attributes = serviceAttributes(log.attributes);
  if (log.message !== "Service operation failed" || log.level !== "error" || !attributes) return null;
  return { ...log, attributes };
}

export function sanitizeSentryMetric(metric: Metric): Metric | null {
  const attributes = serviceAttributes(metric.attributes);
  if (metric.name !== "mfa.service.failures" || metric.type !== "counter" || metric.value !== 1 || !attributes)
    return null;
  return { name: metric.name, value: 1, type: "counter", attributes };
}

function sanitizeSpanName(name: string, operation?: unknown) {
  return typeof operation === "string" && operation.startsWith("db")
    ? "Database operation"
    : redactMessage(name.split(/[?#]/)[0] ?? "Operation").replace(/https?:\/\/[^\s<>"']+/gi, (value) => {
        try {
          const url = new URL(value);
          const ownHost = [
            "modernfundamentalanalyst.com",
            "www.modernfundamentalanalyst.com",
            "localhost",
            "127.0.0.1",
          ].includes(url.hostname);
          return ownHost ? `${url.origin}${url.pathname}` : url.origin;
        } catch {
          return "[URL]";
        }
      });
}

export function sanitizeSentrySpan(span: StreamedSpanJSON): StreamedSpanJSON {
  const name = sanitizeSpanName(span.name, span.attributes["sentry.op"]);
  const attributes: StreamedSpanJSON["attributes"] = {};
  for (const key of [
    "sentry.op",
    "sentry.origin",
    "sentry.kind",
    "sentry.sample_rate",
    "sentry.environment",
    "sentry.release",
    "sentry.segment.id",
    "sentry.sdk.name",
    "sentry.sdk.version",
    "sentry.trace_lifecycle",
    "http.request.method",
    "http.response.status_code",
  ]) {
    if (span.attributes[key] !== undefined) attributes[key] = span.attributes[key];
  }
  for (const [key, value] of Object.entries(span.attributes)) {
    if (key.startsWith("measurements.") && typeof value === "number" && Number.isFinite(value)) attributes[key] = value;
  }
  if (span.is_segment) attributes["sentry.segment.name"] = name;
  else if (typeof span.attributes["sentry.segment.name"] === "string") {
    attributes["sentry.segment.name"] = sanitizeSpanName(span.attributes["sentry.segment.name"]);
  }
  // Streamed spans can contain provider URLs, Redis keys and user scope attributes.
  return { ...span, name, attributes, links: undefined };
}

export function resolveSentryDsn(serverDsn?: string, publicDsn?: string, disabled?: string) {
  // Runtime opt-out must override public values baked into a production build.
  if (disabled === "1") return undefined;
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
  const nextjs = event.contexts?.nextjs;
  if (nextjs) {
    for (const key of ["request_path", "router_path"]) {
      if (typeof nextjs[key] === "string") nextjs[key] = redactMessage(nextjs[key].split(/[?#]/)[0] ?? "");
    }
  }
  if (event.request) {
    event.request = {
      method: event.request.method,
      url: event.request.url?.split(/[?#]/)[0],
    };
  }
  const isChartFailure = event.tags?.feature === "performance-chart";
  const chartMessage = "Performance chart rendering failed";
  if (event.message) event.message = isChartFailure ? chartMessage : redactMessage(event.message);
  for (const exception of event.exception?.values ?? []) {
    if (isChartFailure) {
      exception.value = chartMessage;
      // Custom error names may contain user input; standard types retain useful grouping.
      if (
        ![
          "Error",
          "TypeError",
          "RangeError",
          "ReferenceError",
          "SyntaxError",
          "URIError",
          "EvalError",
          "AggregateError",
        ].includes(exception.type ?? "")
      ) {
        exception.type = "Error";
      }
    } else if (exception.value) exception.value = redactMessage(exception.value);
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
    tracesSampleRate: environment === "production" ? 0.1 : 1,
    tracePropagationTargets: [
      /^\/(?!\/)/,
      /^https:\/\/(www\.)?modernfundamentalanalyst\.com(?:\/|$)/,
      /^http:\/\/localhost(?::\d+)?(?:\/|$)/,
    ],
    beforeSendSpan: sanitizeSentrySpan,
    beforeSendLog: sanitizeSentryLog,
    beforeSendMetric: sanitizeSentryMetric,
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: false,
      httpBodies: [],
      urlQueryParams: false,
      databaseQueryData: false,
      stackFrameVariables: false,
      frameContextLines: 0,
      genAI: { inputs: false, outputs: false },
    },
    beforeSend: sanitizeSentryEvent,
  };
}
