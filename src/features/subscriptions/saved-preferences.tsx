import { SubscriptionPreferencesForm, type PreferencesCopy } from "./subscription-preferences-form";
import { getSavedPreferenceLocale, maskEmail } from "./server/subscription-preferences";
import type { Locale } from "@/lib/i18n";

export async function SavedPreferences({
  copy,
  email,
  token,
  locale,
}: {
  copy: PreferencesCopy;
  email: string;
  token: string;
  locale: Locale;
}) {
  const savedLocale = await getSavedPreferenceLocale(email);
  return (
    <SubscriptionPreferencesForm
      copy={copy}
      email={maskEmail(email)}
      initialLocale={savedLocale}
      token={token}
      locale={locale}
    />
  );
}
