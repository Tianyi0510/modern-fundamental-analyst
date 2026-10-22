import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, expect } from "vitest";
import { server } from "./test-server";
import { rejectUnhandledNetwork } from "./unhandled-network";

const unexpectedRequests: string[] = [];
beforeAll(() =>
  server.listen({
    onUnhandledFrame: rejectUnhandledNetwork((message) => unexpectedRequests.push(message)),
  }),
);
afterEach(() => {
  cleanup();
  server.resetHandlers();
  expect(unexpectedRequests.splice(0), "Every HTTP request needs an explicit MSW handler").toEqual([]);
});
afterAll(() => server.close());
