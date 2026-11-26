import type { replayIntegration } from "@sentry/nextjs";

export function canRecordReplay(href: string) {
  const url = new URL(href, "https://www.modernfundamentalanalyst.com");
  const path = url.pathname.replace(/^\/zh-(?:tw|cn)(?=\/|$)/, "");
  return (
    !url.search && !url.hash && !/^\/(?:support|subscription-preferences|subscription-confirmation)(?:\/|$)/.test(path)
  );
}

export const privateHistoryNavigation = "mfa:private-history-navigation";

export function pushPageUrl(url: URL) {
  if (url.href === window.location.href) return;
  if (!canRecordReplay(url.href)) window.dispatchEvent(new Event(privateHistoryNavigation));
  window.history.pushState(null, "", url);
}

export function createReplayOptions(): NonNullable<Parameters<typeof replayIntegration>[0]> {
  return {
    useCompression: true,
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
