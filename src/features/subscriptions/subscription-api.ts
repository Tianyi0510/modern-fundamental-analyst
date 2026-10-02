import { postJson } from "@/lib/client-post-json";
import type { PreferencesLinkRequest, PreferencesUpdateRequest, SubscribeRequest } from "./subscription-contract";

export async function subscribeToUpdates(input: SubscribeRequest): Promise<void> {
  await postJson("/api/subscribe", input);
}

export async function requestPreferencesLink(input: PreferencesLinkRequest, idempotencyKey: string): Promise<void> {
  await postJson("/api/subscription-preferences/request", input, { idempotencyKey });
}

export async function updatePreferences(input: PreferencesUpdateRequest): Promise<void> {
  await postJson("/api/subscription-preferences", input);
}
