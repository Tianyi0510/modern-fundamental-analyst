import assert from "node:assert/strict";
import test from "node:test";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

const server = setupServer();
const failures = [];
export const providerRequests = [];
test.before(() =>
  server.listen({
    onUnhandledRequest(request) {
      failures.push(`Unhandled request: ${request.method} ${request.url}`);
      throw new Error("Unexpected provider request");
    },
  }),
);
test.beforeEach(() => {
  providerRequests.length = 0;
});
test.afterEach(() => {
  server.resetHandlers();
  assert.deepEqual(failures.splice(0), []);
});
test.after(() => server.close());

// Each scenario declares its allowed methods and paths. Resolvers inspect the
// actual intercepted Request; unexpected routes fail even if the SDK catches them.
export function interceptResendRequests(routes, resolve) {
  for (const route of routes) {
    const [method, path] = route.split(" ");
    server.use(
      http[method.toLowerCase()](`https://api.resend.com${path}`, async ({ request }) => {
        providerRequests.push(request);
        try {
          return await resolve(request.url, {
            method: request.method,
            headers: request.headers,
            signal: request.signal,
            body: await request.text(),
          });
        } catch (error) {
          // Network failures are modeled explicitly; assertion failures must not
          // be swallowed by a service's expected transport-error handling.
          failures.push(error instanceof Error ? error.message : String(error));
          return HttpResponse.error();
        }
      }),
    );
  }
}
