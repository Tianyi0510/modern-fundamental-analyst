import { Resend } from "resend";

export const CONTACT_FROM_EMAIL = "Modern Fundamental Analyst <contact@mail.modernfundamentalanalyst.com>";
export const UPDATES_FROM_EMAIL = "Modern Fundamental Analyst <updates@mail.modernfundamentalanalyst.com>";

export function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}
