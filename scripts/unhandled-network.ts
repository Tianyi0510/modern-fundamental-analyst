import type { UnhandledFrameHandle } from "msw";

// Record unhandled traffic even when application code catches the network error.
export function rejectUnhandledNetwork(record: (message: string) => void): UnhandledFrameHandle {
  return async ({ frame }) => {
    record(await frame.getUnhandledMessage());
    // MSW 3 defaults.error() only logs; throwing prevents network passthrough.
    throw new Error("Unhandled network frame in test");
  };
}
