import { PreferenceEmail } from "../src/features/subscriptions/preference-email";
import { preferenceEmailCopy } from "../src/features/subscriptions/preference-email-copy";
export default function Preview() {
  return (
    <PreferenceEmail
      locale="en"
      copy={preferenceEmailCopy["en"]}
      preferencesUrl="https://example.com/subscription-preferences?token=preview-only"
    />
  );
}
