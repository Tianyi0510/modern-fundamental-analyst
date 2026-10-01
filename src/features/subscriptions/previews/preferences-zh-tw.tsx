import { PreferenceEmail } from "../preference-email";
import { preferenceEmailCopy } from "../preference-email-copy";
export default function Preview() {
  return (
    <PreferenceEmail
      locale="zh-tw"
      copy={preferenceEmailCopy["zh-tw"]}
      preferencesUrl="https://example.com/subscription-preferences?token=preview-only"
    />
  );
}
