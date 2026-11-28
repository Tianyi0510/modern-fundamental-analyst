import type { ErrorEvent, init } from "@sentry/nextjs";
import type { Log, Metric, StreamedSpanJSON } from "@sentry/core";

import {
  isSentryDeploymentHost,
  isSentryLoopbackHost,
  resolveSentryDsn,
  resolveSentryEnvironment,
  testSentryDsn,
} from "./sentry-dsn";

export function resolveServerSentryDsn() {
  if (process.env.NODE_ENV === "production" && (process.env.VERCEL !== "1" || !process.env.VERCEL_REGION?.trim()))
    return;
  const dsn = resolveSentryDsn(process.env.SENTRY_DSN, process.env.NEXT_PUBLIC_SENTRY_DSN, process.env.SENTRY_DISABLED);
  if (resolveSentryEnvironment(process.env.VERCEL_ENV, process.env.NODE_ENV) === "test" && dsn !== testSentryDsn)
    return;
  return dsn;
}

const serviceMetadataKeys = ["sentry.environment", "sentry.release", "sentry.sdk.name", "sentry.sdk.version"];
const spanAttributeKeys = [
  "sentry.op",
  "sentry.origin",
  "sentry.kind",
  "sentry.sample_rate",
  ...serviceMetadataKeys,
  "sentry.segment.id",
  "sentry.trace_lifecycle",
  "http.request.method",
  "http.response.status_code",
];
function sanitizeSentryUrl(address: string): string {
  const path = address.trim();
  if (!/^(?:blob:|https?:|\/\/)/i.test(path)) return address.split(/[?#]/, 1)[0] ?? "";
  try {
    const url = new URL(path.startsWith("//") ? `https:${path}` : path);
    if (url.origin === "null") return "[URL]";
    const host = (url.protocol === "blob:" ? new URL(url.origin).hostname : url.hostname).replace(/\.$/, "");
    if (!isSentryDeploymentHost(host) && !isSentryLoopbackHost(host)) return url.origin;
    url.search = "";
    url.hash = "";
    return url.protocol === "blob:" ? url.href : url.origin + url.pathname;
  } catch {
    return "[URL]";
  }
}

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
  for (const key of serviceMetadataKeys) {
    if (typeof attributes?.[key] === "string") result[key] = attributes[key];
  }
  return result;
}

function sanitizeSentryLog(log: Log): Log | null {
  const attributes = serviceAttributes(log.attributes);
  if (log.message !== "Service operation failed" || log.level !== "error" || !attributes) return null;
  return { ...log, attributes };
}

function sanitizeSentryMetric(metric: Metric): Metric | null {
  const attributes = serviceAttributes(metric.attributes);
  if (metric.name !== "mfa.service.failures" || metric.type !== "counter" || metric.value !== 1 || !attributes)
    return null;
  return { name: metric.name, value: 1, type: "counter", attributes };
}

function sanitizeSpanName(name: string, operation?: unknown) {
  return typeof operation === "string" && operation.startsWith("db")
    ? "Database operation"
    : redactMessage(name.split(/[?#]/)[0] ?? "Operation");
}

export function sanitizeSentrySpan(span: StreamedSpanJSON): StreamedSpanJSON {
  const name = sanitizeSpanName(span.name, span.attributes["sentry.op"]);
  const attributes: StreamedSpanJSON["attributes"] = {};
  for (const key of spanAttributeKeys) {
    if (span.attributes[key] !== undefined) attributes[key] = span.attributes[key];
  }
  for (const key in span.attributes) {
    if (!key.startsWith("measurements.") || !Object.hasOwn(span.attributes, key)) continue;
    const value = span.attributes[key];
    if (typeof value === "number" && Number.isFinite(value)) attributes[key] = value;
  }
  if (span.is_segment) attributes["sentry.segment.name"] = name;
  else if (typeof span.attributes["sentry.segment.name"] === "string") {
    attributes["sentry.segment.name"] = sanitizeSpanName(span.attributes["sentry.segment.name"]);
  }
  // Streamed spans can contain provider URLs, Redis keys and user scope attributes.
  return { ...span, name, attributes, links: undefined };
}

function redactMessage(value: string) {
  return (
    value
      // Keep diagnostic identifiers intact, including quoted private fields and member access.
      .replace(/[^\s<>"]+/g, (token: string, offset: number) => {
        const suffix = token.search(/[?#]/);
        if (suffix < 0) return token;
        const preceding = value.slice(0, offset);
        if (/^#\d+[.,;:!?)]?$/.test(token) && /\bReact error\s+$/i.test(preceding)) return token;
        const prefix = token.slice(0, suffix);
        // A request target such as receipt.#anchor can also look like member access.
        if (/\b(?:GET|HEAD|POST|PUT|DELETE|CONNECT|OPTIONS|TRACE|PATCH)\s+"?$/i.test(preceding)) {
          return token.startsWith("'") && token.endsWith("'") ? prefix + "'" : prefix;
        }
        const diagnosticField =
          (prefix === "" || prefix === "'") &&
          /\b(?:private (?:member|field|method|accessor|name)|identifier|cannot initialize|cannot use 'in' operator to search for)\s+["']?$/i.test(
            preceding,
          );
        const accessorDiagnostic =
          prefix === "'" &&
          token.endsWith("'") &&
          /^ was defined without a (?:getter|setter)\b/.test(value.slice(offset + token.length));
        const memberAccess = /^[$_\p{ID_Start}][$_\p{ID_Continue}]*\.$/u.test(prefix);
        if (
          (diagnosticField || accessorDiagnostic || memberAccess) &&
          /^#[$_\p{ID_Start}][$_\p{ID_Continue}]*'?[.,;:!?)]?$/u.test(token.slice(suffix))
        )
          return token;
        return token.slice(0, suffix);
      })
      .replace(/('?)((?:blob:)?(?:https?:)?\/\/[^\s<>"]+)/gi, (_match, openingQuote: string, target: string) => {
        const closingQuote = openingQuote && target.endsWith("'") ? "'" : "";
        const address = closingQuote ? target.slice(0, -1) : target;
        return openingQuote + sanitizeSentryUrl(address) + closingQuote;
      })
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[Email]")
      .replace(/\bBearer\s+\S+/gi, "Bearer [Filtered]")
  );
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
      url: event.request.url && sanitizeSentryUrl(event.request.url),
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
      if (frame.filename) frame.filename = sanitizeSentryUrl(frame.filename);
      if (frame.abs_path) frame.abs_path = sanitizeSentryUrl(frame.abs_path);
      delete frame.vars;
    }
  }
  for (const image of event.debug_meta?.images ?? []) {
    if (image.code_file) image.code_file = sanitizeSentryUrl(image.code_file);
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
