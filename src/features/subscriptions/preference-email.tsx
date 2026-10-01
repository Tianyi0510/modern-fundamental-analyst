import { render, Text } from "react-email";
import { EmailButton, EmailLayout } from "@/components/email-layout";
import type { Locale } from "@/lib/i18n";
import { preferenceEmailCopy } from "./preference-email-copy";

type PreferenceEmailCopy = Omit<(typeof preferenceEmailCopy)["en"], "subject">;
export function PreferenceEmail({
  copy,
  preferencesUrl,
  locale,
}: {
  copy: PreferenceEmailCopy;
  preferencesUrl: string;
  locale: Locale;
}) {
  return (
    <EmailLayout locale={locale} heading={copy.heading}>
      <Text style={{ fontSize: "17px", lineHeight: "28px", margin: "0 0 24px" }}>{copy.body}</Text>
      <EmailButton href={preferencesUrl}>{copy.action}</EmailButton>
      <Text style={{ fontSize: "13px", lineHeight: "20px", margin: "28px 0 0" }}>{copy.note}</Text>
    </EmailLayout>
  );
}
export function renderPreferenceEmail(copy: PreferenceEmailCopy, preferencesUrl: string, locale: Locale = "en") {
  return render(<PreferenceEmail copy={copy} preferencesUrl={preferencesUrl} locale={locale} />);
}
