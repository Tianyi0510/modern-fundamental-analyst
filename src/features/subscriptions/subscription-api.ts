import { postJson } from "@/lib/client-post-json";
import type {
  PreferencesLinkRequest,
  PreferencesUpdateRequest,
  SubscribeRequest,
  SubscriptionConfirmationRequest,
} from "./subscription-contract";

export async function confirmSubscription(input: SubscriptionConfirmationRequest): Promise<void> {
  await postJson("/api/subscription-confirmation", input);
}

export async function subscribeToUpdates(input: SubscribeRequest, idempotencyKey?: string): Promise<void> {
  await postJson("/api/subscribe", input, { idempotencyKey });
}

export async function requestPreferencesLink(input: PreferencesLinkRequest, idempotencyKey: string): Promise<void> {
  await postJson("/api/subscription-preferences/request", input, { idempotencyKey });
}

export async function updatePreferences(input: PreferencesUpdateRequest): Promise<void> {
  await postJson("/api/subscription-preferences", input);
}
