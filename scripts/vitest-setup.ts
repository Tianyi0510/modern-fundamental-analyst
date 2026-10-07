import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, expect } from "vitest";
import { server } from "./test-server";

const unexpectedRequests: string[] = [];
beforeAll(() =>
  server.listen({
    onUnhandledRequest(request, print) {
      unexpectedRequests.push(`${request.method} ${new URL(request.url).pathname}`);
      print.error();
    },
  }),
);
afterEach(() => {
  cleanup();
  server.resetHandlers();
  expect(unexpectedRequests.splice(0), "Every HTTP request needs an explicit MSW handler").toEqual([]);
});
afterAll(() => server.close());
