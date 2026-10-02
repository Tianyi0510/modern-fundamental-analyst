import { PreferenceEmail } from "../preference-email";
import { preferenceEmailCopy } from "../preference-email-copy";
export default function Preview() {
  return (
    <PreferenceEmail
      locale="zh-cn"
      copy={preferenceEmailCopy["zh-cn"]}
      preferencesUrl="https://example.com/subscription-preferences?token=preview-only"
    />
  );
}
