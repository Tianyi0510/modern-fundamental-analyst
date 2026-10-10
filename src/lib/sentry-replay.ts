import type { replayIntegration } from "@sentry/nextjs";

export function canRecordReplay(href: string) {
  const url = new URL(href, "https://www.modernfundamentalanalyst.com");
  const path = url.pathname.replace(/^\/zh-(?:tw|cn)(?=\/|$)/, "");
  return (
    !url.search && !url.hash && !/^\/(?:support|subscription-preferences|subscription-confirmation)(?:\/|$)/.test(path)
  );
}

export function createReplayOptions(environment?: string): NonNullable<Parameters<typeof replayIntegration>[0]> {
  return {
    useCompression: environment !== "test",
    maskAllText: true,
    maskAllInputs: true,
    blockAllMedia: true,
    block: ["form", "a[href*='?']", "a[href*='#']"],
    maskAttributes: ["title", "placeholder", "aria-label", "href", "value"],
    networkDetailAllowUrls: [],
    networkCaptureBodies: false,
    // Keep DOM interaction playback without console or network payloads.
    beforeAddRecordingEvent: () => null,
  };
}
