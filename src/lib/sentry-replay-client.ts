import { addIntegration, replayIntegration } from "@sentry/nextjs";
import { createReplayOptions } from "./sentry-replay";

export function initializeReplay(environment: string) {
  addIntegration(replayIntegration(createReplayOptions(environment)));
}
