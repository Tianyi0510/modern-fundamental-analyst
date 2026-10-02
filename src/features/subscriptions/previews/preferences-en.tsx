import { PreferenceEmail } from "../preference-email";
import { preferenceEmailCopy } from "../preference-email-copy";
export default function Preview() {
  return (
    <PreferenceEmail
      locale="en"
      copy={preferenceEmailCopy["en"]}
      preferencesUrl="https://example.com/subscription-preferences?token=preview-only"
    />
  );
}
