import { isValidEmail } from "@/lib/email-validation";

export type ContactField = "name" | "email" | "subject" | "message";
export type ContactFields = Record<ContactField, string>;

export function getInvalidContactFields(fields: ContactFields): ContactField[] {
  const invalid: ContactField[] = [];
  const hasText = (value: string) => value.replace(/\p{Cc}/gu, "").trim().length > 0;
  if (!hasText(fields.name)) invalid.push("name");
  const email = fields.email.trim();
  if (!isValidEmail(email)) invalid.push("email");
  if (!hasText(fields.subject)) invalid.push("subject");
  if (fields.message.trim().length < 10) invalid.push("message");
  return invalid;
}
