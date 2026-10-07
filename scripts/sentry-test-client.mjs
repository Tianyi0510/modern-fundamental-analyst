import { getClient, setCurrentClient } from "@sentry/core";
import Sentry from "@sentry/nextjs";
import { createSentryOptions } from "../src/lib/sentry-options.ts";

export function monitoringCapture(t) {
  const events = [];
  const logs = [];
  const metrics = [];
  const spans = [];
  const previous = getClient();
  const client = new Sentry.NodeClient({
    ...createSentryOptions("https://public@sentry.invalid/1", "test"),
    integrations: [],
    stackParser: () => [],
    transport: () => ({
      send(envelope) {
        for (const [header, payload] of envelope[1]) {
          if (header.type === "event") events.push(payload);
          if (header.type === "log") logs.push(...payload.items);
          if (header.type === "trace_metric") metrics.push(...payload.items);
          if (header.type === "span") spans.push(...payload.items);
        }
        return Promise.resolve({ statusCode: 200 });
      },
      flush: () => Promise.resolve(true),
    }),
  });
  setCurrentClient(client);
  client.init();
  t.after(async () => {
    await client.close(1000);
    setCurrentClient(previous);
  });
  return { events, logs, metrics, spans, flush: () => client.flush(1000) };
}
