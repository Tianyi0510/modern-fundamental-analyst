import type { Locale } from "@/lib/i18n";

export const contactFieldLimits = { name: 100, email: 254, subject: 160, message: 5000 } as const;
type ContactField = keyof typeof contactFieldLimits;
export type ContactDraft = Record<ContactField, string> & { submissionId?: string };
const storageKey = (locale: Locale) => `mfa:contact-draft:v1:${locale}`;

export function readContactDraft(locale: Locale): ContactDraft | undefined {
  try {
    const value: unknown = JSON.parse(sessionStorage.getItem(storageKey(locale)) ?? "null");
    if (typeof value !== "object" || value === null) return;
    if (
      !("name" in value) ||
      typeof value.name !== "string" ||
      value.name.length > contactFieldLimits.name ||
      !("email" in value) ||
      typeof value.email !== "string" ||
      value.email.length > contactFieldLimits.email ||
      !("subject" in value) ||
      typeof value.subject !== "string" ||
      value.subject.length > contactFieldLimits.subject ||
      !("message" in value) ||
      typeof value.message !== "string" ||
      value.message.length > contactFieldLimits.message
    )
      return;
    const submissionId = "submissionId" in value ? value.submissionId : undefined;
    if (
      submissionId !== undefined &&
      (typeof submissionId !== "string" || !/^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i.test(submissionId))
    )
      return;
    return {
      name: value.name,
      email: value.email,
      subject: value.subject,
      message: value.message,
      ...(submissionId ? { submissionId } : {}),
    };
  } catch {
    // Storage may be unavailable; sending a message must still work.
    return;
  }
}

export function saveContactDraft(locale: Locale, draft: ContactDraft) {
  try {
    if (Object.keys(contactFieldLimits).some((field) => draft[field as ContactField])) {
      sessionStorage.setItem(storageKey(locale), JSON.stringify(draft));
    } else {
      sessionStorage.removeItem(storageKey(locale));
    }
  } catch {
    // Draft persistence is optional when the browser denies storage.
  }
}

export function clearContactDraft(locale: Locale, submissionId: string) {
  // A late response from an unmounted form must not erase a newer edited draft.
  if (readContactDraft(locale)?.submissionId !== submissionId) return;
  try {
    sessionStorage.removeItem(storageKey(locale));
  } catch {
    // The completed submission does not depend on storage cleanup.
  }
}
