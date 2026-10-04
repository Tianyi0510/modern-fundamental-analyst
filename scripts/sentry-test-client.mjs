import { getClient, setCurrentClient } from "@sentry/core";
import Sentry from "@sentry/nextjs";
import { createSentryOptions } from "../src/lib/sentry-options.ts";

export function monitoringCapture(t) {
  const events = [];
  const previous = getClient();
  const client = new Sentry.NodeClient({
    ...createSentryOptions("https://public@sentry.invalid/1", "test"),
    integrations: [],
    stackParser: () => [],
    transport: () => ({
      send(envelope) {
        for (const [header, payload] of envelope[1]) if (header.type === "event") events.push(payload);
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
  return { events, flush: () => client.flush(1000) };
}
