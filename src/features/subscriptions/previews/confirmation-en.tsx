import { PreferenceEmail } from "../preference-email";
import { confirmationCopy } from "../confirmation-copy";
export default function Preview() {
  return (
    <PreferenceEmail
      copy={confirmationCopy["en"]}
      locale="en"
      preferencesUrl="https://example.com/subscription-confirmation?token=preview-only"
    />
  );
}
