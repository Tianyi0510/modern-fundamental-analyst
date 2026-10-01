import { SubscriptionPreferencesForm, type PreferencesCopy } from "./subscription-preferences-form";
import { getSavedPreferenceLocale, maskEmail } from "./server/subscription-preferences";

export async function SavedPreferences({
  copy,
  email,
  token,
}: {
  copy: PreferencesCopy;
  email: string;
  token: string;
}) {
  const savedLocale = await getSavedPreferenceLocale(email);
  return <SubscriptionPreferencesForm copy={copy} email={maskEmail(email)} initialLocale={savedLocale} token={token} />;
}
