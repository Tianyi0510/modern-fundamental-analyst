import { addIntegration, replayIntegration } from "@sentry/nextjs";
import { createReplayOptions } from "./sentry-replay";

export function initializeReplay() {
  addIntegration(replayIntegration(createReplayOptions()));
}
