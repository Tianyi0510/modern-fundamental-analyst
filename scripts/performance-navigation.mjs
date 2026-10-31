export const performanceOrigin = "http://127.0.0.1:3211";
export const preparationUrl = `${performanceOrigin}/robots.txt`;

// Prepare a same-origin renderer before tracing without loading application assets.
// Lighthouse still clears storage and the browser cache before the measured navigation.
export default {
  extends: "lighthouse:default",
  settings: { blankPage: preparationUrl, disableStorageReset: false },
};

export function validatePreparationResponse(response) {
  if (
    response.status !== 200 ||
    response.url !== preparationUrl ||
    !/^text\/plain(?:;|$)/i.test(response.headers.get("content-type") ?? "") ||
    response.headers.get("cross-origin-opener-policy") !== "same-origin"
  ) {
    throw new Error("Performance preparation requires same-origin plain text with matching COOP");
  }
}

export function validateNavigationTrace(trace, targetUrl) {
  const events = trace.traceEvents ?? [];
  const frames = events.find((event) => event.name === "TracingStartedInBrowser")?.args?.data?.frames ?? [];
  const frame = frames.find((entry) => entry.isOutermostMainFrame && entry.url === preparationUrl);
  if (!frame || !Number.isInteger(frame.processId)) throw new Error("Missing prepared main-frame trace evidence");
  const commit = events.find(
    (event) =>
      event.name === "FrameCommittedInBrowser" &&
      event.args?.data?.frame === frame.frame &&
      event.args.data.url === targetUrl,
  );
  if (!commit || commit.args.data.processId !== frame.processId)
    throw new Error("Measured navigation changed renderer after tracing started");
  if (
    !events.some(
      (event) =>
        event.name === "navigationStart" &&
        event.args?.frame === frame.frame &&
        event.args?.data?.documentLoaderURL === targetUrl &&
        event.pid === frame.processId,
    )
  ) {
    throw new Error("Missing measured main-frame navigationStart");
  }
}
