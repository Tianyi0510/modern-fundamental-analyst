import type { Locale } from "@/lib/i18n";

export type SubscribeRequest = { email: string; website: string; locale: Locale };
export type PreferencesLinkRequest = { email: string; locale: Locale };
export type PreferencesAction = "save" | "unsubscribe";
export type PreferencesUpdateRequest =
  { action: "save"; locale: Locale; token: string } | { action: "unsubscribe"; locale: Locale | ""; token: string };
